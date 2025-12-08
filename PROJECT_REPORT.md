# Requirement Bot UI — Project Report

## Abstract

This project delivers a modern, interactive Requirements Engineering assistant that guides stakeholders through a structured, conversational workflow and produces an actionable, standards‑aligned summary. The system couples a React 18 front‑end (Vite, TypeScript, Shadcn UI) with a lightweight Node API layer and PostgreSQL persistence. Google Gemini 2.0 Flash powers natural‑language understanding to capture requirements, synthesize a structured JSON summary, and persist it with the project record. The dashboard provides dynamic project management, secure authentication, summary viewing/export, settings management, and an overview of activity. The result is a practical, fast, and reliable tool for turning raw stakeholder dialogue into high‑quality specifications.

## Introduction

Effective requirements gathering remains a critical challenge in software projects. Traditional interviews and documents can be slow, inconsistent, and hard to synthesize. This application streamlines the process by:
- Running guided chat sessions to elicit functional and non‑functional requirements.
- Structuring outputs into a consistent JSON format for easy display and export.
- Persisting project and summary data in a relational database.
- Providing a dynamic dashboard for project lifecycle management.

By integrating conversational AI (Gemini 2.0 Flash) with a robust UI and backend, the workflow accelerates discovery while improving traceability and quality.

## Problem Statement

Teams need a fast, reliable way to capture stakeholder needs, organize them into engineering‑ready artifacts, and keep them accessible throughout the project. The key problems addressed are:
- Capturing diverse stakeholder inputs without losing context.
- Transforming free‑form conversation into structured specifications.
- Persisting project state (chats, summaries) with user attribution.
- Enabling secure access, lifecycle actions (view, export, delete), and clear UX.

This system addresses these needs with a cohesive chat‑to‑summary pipeline, backed by durable storage and a focused dashboard experience.

## Hardware and Software Requirements

Hardware
- Development machine: 4+ cores CPU, 8–16 GB RAM, SSD storage
- Deployment: similar or containerized environment (Docker‑ready)

Software
- Operating System: Windows 10/11 (development), Linux/Windows (deployment)
- Runtime: Node.js (LTS), npm
- Frontend: React 18, Vite 5, TypeScript, Tailwind CSS, Shadcn UI (Radix)
- Backend: Node API endpoints, PostgreSQL (v14+), `pg`
- AI Integration: Google Generative Language API (Gemini 2.0 Flash)
- Tooling: ESLint, PostCSS, Tailwind plugins

## Diagrams (Structural and Behavioural)

Architecture (Structural)

```mermaid
flowchart LR
  subgraph Client [Frontend (React + Vite + Shadcn UI)]
    A[Dashboard]
    A1[Projects Tab]
    A2[Chat Session]
    A3[Summary Tab]
    A4[Settings / Overview]
  end

  subgraph API [Node API Layer]
    B1[/api/login]
    B2[/api/projects]
    B3[/api/chat]
    B4[/api/generate-summary]
  end

  subgraph DB [PostgreSQL]
    C1[(users)]
    C2[(projects\nsummary, created_by)]
    C3[(chat_messages)]
  end

  A1 -->|CRUD projects| B2 --> C2
  A2 -->|send messages| B3 --> C3
  A3 -->|generate/view| B4 --> C2
  A4 -->|auth/profile| B1 --> C1

  B3 -->|Gemini 2.0 Flash| G[(Generative Language API)]
  B4 -->|Gemini (JSON summary)| G
```

Sequence (Behavioural)

```mermaid
sequenceDiagram
  participant U as User
  participant UI as Frontend (Chat/Dashboard)
  participant API as Node API
  participant DB as PostgreSQL
  participant AI as Gemini 2.0 Flash

  U->>UI: Start project and chat
  UI->>API: POST /api/chat { message, projectId }
  API->>AI: generateContent(message + context)
  AI-->>API: reply text
  API-->>UI: chat response
  UI->>API: POST /api/generate-summary { projectId }
  API->>DB: SELECT chat_messages WHERE projectId
  API->>AI: generateContent(conversation -> JSON summary)
  AI-->>API: structured JSON summary
  API->>DB: BEGIN; UPDATE projects.summary; DELETE chat_messages; COMMIT
  API-->>UI: success + summary data
  UI->>U: Redirect to Summary tab, allow PDF export
```

## How It Works

Authentication and Roles
- Users authenticate via email/password; passwords stored hashed.
- Successful login returns basic profile and role for client routing.

Projects Lifecycle
- Create, list (by `created_by`), update, delete projects via API.
- Each project can hold a generated `summary` (JSON string) persisted in the database.

Chat Capture
- The chat session sends user messages to the API, which relays to Gemini 2.0 Flash.
- Responses are parsed robustly and displayed in the UI.
- Messages are stored per project for context and later summarization.

Structured Summary Generation
- On “Generate Summary”, the API fetches the full conversation for the project.
- Gemini produces a JSON summary with the mandated headings.
- The API executes a transaction: update the project’s `summary`, then clear `chat_messages` for that project.
- The UI redirects to the Summary tab, where the data is displayed and can be exported as PDF.

Dashboard Features
- Projects Tab: list user‑specific projects; view summary or delete with themed confirmation.
- Summary Tab: displays structured sections; allows PDF export in managed order.
- Settings Tab: email is fixed; name update gated by password; password change flow validates and applies securely.
- Overview Tab: shows totals (projects, chats) and latest project.

## Reference

- React: https://react.dev/
- Vite: https://vitejs.dev/
- TypeScript: https://www.typescriptlang.org/
- Tailwind CSS: https://tailwindcss.com/
- Radix UI / Shadcn UI: https://www.radix-ui.com/ and https://ui.shadcn.com/
- PostgreSQL: https://www.postgresql.org/docs/
- Node `pg`: https://node-postgres.com/
- Google Generative Language API (Gemini): https://ai.google.dev/

