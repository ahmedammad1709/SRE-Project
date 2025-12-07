# Data Storage and AI Workflow

## Overview
- This document explains how projects and chats are stored, how text is sent to Gemini, and the end-to-end workflow to generate a structured summary.

## Database Schema
- Projects table
  - Columns: `id`, `name`, `description`, `created_at`
  - Definition: `api/projects.js:71-76`
- Chat messages table
  - Columns: `id`, `project_id`, `role` (`user` | `bot`), `content`, `created_at`
  - Definition: `api/chat.js:158-164`

## Storage Flows
- Create project
  - Client calls `POST /api/projects` with `name`, optional `description`.
  - Server inserts a row into `projects` and returns `id`, `name`, `description`, `created_at`.
  - Reference: `api/projects.js:31-40`
- List projects
  - Client calls `GET /api/projects`.
  - Server returns all rows from `projects`.
  - Reference: `api/projects.js:26-29`
- Save chat messages
  - Client first saves the user message via `POST /api/chat` with `role="user"`, `content`, `projectId`.
  - Server inserts into `chat_messages` and returns the saved message.
  - Reference: `api/chat.js:142-147`

## Conversation with Gemini
- Request construction
  - Client builds `conversationHistory` from prior messages, mapping each entry to Gemini format (`role: user|model`, `parts: [{ text }]`).
  - Reference: `src/components/dashboard/ChatInterface.tsx:100-104`
- Server call
  - Client then calls `POST /api/chat` with `role="conversation"`, the latest user `content`, `conversationHistory`, and `projectName`.
  - Server forwards the conversation to Gemini using `callGeminiConversation(...)`.
  - Reference: `src/components/dashboard/ChatInterface.tsx:135-145`, `api/chat.js:120-140`
- System instruction and contents
  - The server sets a system instruction with requirements-gathering rules and passes the conversation plus the latest user message.
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
  - Reference: `api/chat.js:30-56`, `api/chat.js:84-88`
- Response parsing and save
  - Server merges Gemini response parts to a single text.
  - Server returns the text to client; client saves it as a `bot` message via `POST /api/chat`.
  - References: `api/chat.js:85-96`, `src/components/dashboard/ChatInterface.tsx:155-169`

## Summary Generation Workflow
- Trigger
  - In the chat header, clicking `Generate Summary` calls `POST /api/generate-summary` with `projectId`.
  - Reference: `src/components/dashboard/tabs/NewProjectTab.tsx:149-176`
- Conversation aggregation
  - Server loads the full conversation for the given `projectId` from `chat_messages` ordered by time.
  - Messages are converted to Gemini format (`role: user|model`, `parts: [{ text }]`).
  - Reference: `api/generate-summary.js:183-199`
- Prompt and model
  - Server composes your JSON-schema prompt with mandatory sections and approximate values for missing data.
  - Sends to Gemini `gemini-2.0-flash` with `responseMimeType: "application/json"` to enforce JSON output.
  - References: `api/generate-summary.js:30-89`, `api/generate-summary.js:91-111`
- Normalization and return
  - Server parses Gemini’s JSON and maps keys to the UI schema: `functional`, `nonFunctional`, `stakeholders`, `userStories`, `constraints`, `risks`, `timeline`, `costEstimate`.
  - Reference: `api/generate-summary.js:118-149`
  - The response `{ success: true, data: ... }` is returned to the client.
- UI rendering and navigation
  - The New Project tab stores the summary and navigates to the Summary tab.
  - The Summary tab accepts `initialData` and renders cards for each section.
  - References: `src/pages/Dashboard.tsx:98-110`, `src/components/dashboard/tabs/SummaryTab.tsx:26-36`, `src/components/dashboard/tabs/SummaryTab.tsx:219-361`

## Endpoints
- `GET /api/projects` — list projects
- `POST /api/projects` — create project
- `GET /api/chat?projectId=...` — list chat history by project
- `POST /api/chat` — save user/bot message or request Gemini conversation
- `POST /api/generate-summary` — generate structured summary JSON for a project

## Data Models (effective)
- Project
  - `id: number`, `name: string`, `description?: string`, `created_at: timestamp`
- ChatMessage
  - `id: number`, `project_id: number`, `role: "user"|"bot"`, `content: string`, `created_at: timestamp`
- Summary JSON (UI-mapped)
  - `overview?: string`
  - `functional: string[]`
  - `nonFunctional: string[]`
  - `stakeholders: string[]` (normalized to `Name (Role)` when available)
  - `userStories: string[]`
  - `constraints: string[]`
  - `risks: string[]`
  - `timeline?: string`
  - `costEstimate?: string`
  - `summary?: string`

## Environment
- Gemini API key: `VITE_GEMINI_API_KEY` or `GEMINI_API_KEY`
- Dev proxy target: `VERCEL_DEV_URL` (used by Vite dev server proxy)
- References: `api/generate-summary.js:25-28`, `api/chat.js:25-28`, `vite.config.ts:11-16`
