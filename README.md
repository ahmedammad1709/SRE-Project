# Software Requirements Bot — Application Overview

## What It Is
- AI-assisted tool to gather, structure, and export Software Requirements Specifications (SRS).
- Conversational UX to capture requirements; converts chat into a structured summary and a polished PDF.

## Key Features
- Chat-based requirements gathering with context tracking.
- Summary generation with AI including Project Overview, Functional/Non-Functional, Stakeholders, Risks, User Stories, Timeline, Cost.
- PDF export with a title page and clean section formatting.
- Dashboard for users; Admin dashboard for oversight and management.
- Authentication, password reset with OTP email flow.
- Theme toggle, brand logo usage across app and chat.

## Architecture
- Frontend: React 18 + Vite 5 + TypeScript, Tailwind + Shadcn UI.
- Backend: Lightweight Node API (ESM) endpoints under `api/`.
- Database: PostgreSQL via `pg`.
- AI: Gemini 2.0 Flash (primary) with ChatGPT fallback.

## Data Flow
- Start project and chat
  - Client saves each user message and requests AI response; server persists conversation.
  - Client implementation: `src/components/dashboard/ChatInterface.tsx:100` to `src/components/dashboard/ChatInterface.tsx:176`.
  - API handler: `api/chat.js:176` POST for message save, conversation pathway.
- Generate summary
  - Triggered from New Project tab with confirmation; server aggregates chat and asks AI for structured JSON.
  - Client trigger: `src/components/dashboard/tabs/NewProjectTab.tsx:170` to `src/components/dashboard/tabs/NewProjectTab.tsx:213`.
  - Server AI call and mapping: `api/generate-summary.js:381` to `api/generate-summary.js:396` with JSON headings including Project Overview.
- View summary
  - Summary tab shows sections and supports PDF.
  - UI rendering (overview, cost, timeline, etc.): `src/components/dashboard/tabs/SummaryTab.tsx:135` to `src/components/dashboard/tabs/SummaryTab.tsx:155`.
- Export PDF
  - Summary tab posts full data plus client/project details to the PDF API.
  - Client request: `src/components/dashboard/tabs/SummaryTab.tsx:52` to `src/components/dashboard/tabs/SummaryTab.tsx:88`.
  - PDF generation:
    - Title page: `api/generate-report.js:120` to `api/generate-report.js:167`.
    - Sections and cost/timeline: `api/generate-report.js:212` to `api/generate-report.js:246`.
    - Response as attachment: `api/generate-report.js:267` to `api/generate-report.js:273`.

## Endpoints
- `/api/projects` CRUD and listing by `created_by`.
- `/api/chat` load conversation, save messages, AI conversation response.
- `/api/generate-summary` aggregate chat → AI JSON summary → persist in `projects.summary`.
- `/api/generate-report` compose SRS PDF from summary and client details.

## Authentication & Accounts
- Signup with OTP email, login with password; passwords stored hashed.
- Admin role gate for admin dashboard and user banning/unbanning.
- Client side routes: `src/App.tsx:20` to `src/App.tsx:39`.

## Configuration
- Environment variables
  - `DATABASE_URL` or equivalent for PostgreSQL.
  - `VITE_GEMINI_API_KEY` (primary AI) and optionally `VITE_CHATGPT_API_KEY` (fallback).
  - During local dev, proxy expects an API server. Vite proxy config: `vite.config.ts:12` to `vite.config.ts:16`.
- Development API server (simple router)
  - Run a local API on a port and point `VERCEL_DEV_URL` to it, e.g. `http://localhost:3001`.
  - Router mapping: `scripts/dev-api.js:4` to `scripts/dev-api.js:13`.

## Usage Workflow
- Create new project in dashboard; begin chat to collect requirements.
- When conversation is complete, click “Generate Summary” to produce structured sections.
- Review in Summary tab; click “Download PDF Report” for SRS.
- Admin can view projects and users; filter by summary availability.

## PDF Format
- Title page includes: Software Requirements Specification (SRS) Report, Project, Client, Email, Generated date.
- Sections: Project Overview, Functional Requirements, Non-Functional Requirements, User Stories, Stakeholders, Constraints, Risks, Cost Estimate & Timeline.
- If any section is missing, the PDF prints “Not provided”.

## Security & Best Practices
- No secrets are logged; keys read from environment.
- Passwords hashed (`bcryptjs`), never stored or displayed in plaintext.
- Basic input validation in API routes; transaction used for summary persistence.

## Extensibility
- Add more sections or custom fields in `api/generate-summary.js` and `api/generate-report.js`.
- Enhance the UI cards in `SummaryTab.tsx` to display additional computed metrics.
- Swap or tune AI providers via environment keys without changing the UI.

## Troubleshooting
- PDF not downloading: ensure `/api/generate-report` is reachable and summary exists.
- AI response issues: verify `VITE_GEMINI_API_KEY` or fallback key and network access.
- Dev proxy errors: set `VERCEL_DEV_URL` to your local API server and run it.
