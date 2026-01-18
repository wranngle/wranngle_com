# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies
bun install

# Development (hot reload, runs on port 5000)
bun run dev

# Type checking
bun run check

# Lint
bun run lint
bun run lint:fix

# Production build (outputs to dist/)
bun run build

# Run production build
bun run start
```

## Architecture

**Monorepo-lite structure** with shared code between client and server:

```
client/          → React frontend (Vite)
├── src/
│   ├── components/ui/   → Shadcn/Radix UI components
│   └── hooks/           → React hooks (use-toast, etc.)
server/          → Express backend
├── index.ts     → Server entry, Vite middleware in dev
├── routes.ts    → API route registration
└── storage.ts   → Data storage interface (in-memory)
shared/          → Shared TypeScript types
└── schema.ts    → ArkType schemas (validation + types)
script/          → Build scripts
└── build.ts     → Production build (esbuild + Vite)
```

**Key architectural patterns:**
- **Shared schema**: `shared/schema.ts` defines ArkType schemas used for both validation and TypeScript types across client/server
- **API routes**: All API endpoints under `/api` (e.g., `/api/leads`, `/api/health`)
- **Single server**: Express serves both API routes and static frontend (Vite middleware in dev, static files in prod)
- **Path aliases**: `@` → `client/src`, `@shared` → `shared` (configured in vite.config.ts and tsconfig)

## Tech Stack

- **Runtime**: Bun
- **Frontend**: React, Tailwind CSS, Framer Motion, Radix UI, React Query, wouter
- **Backend**: Express.js
- **Validation**: ArkType (not Zod)
- **Linting**: XO with Prettier
- **Build**: Vite (client), esbuild (server)

## Important Notes

- **Validation uses ArkType**, not Zod. Schemas are defined with `type({...})` syntax in `shared/schema.ts`
- **In-memory storage**: Current implementation uses `MemStorage` class - no database required for development
- **ElevenLabs widget**: The page embeds `<elevenlabs-convai>` for the AI voice agent demo
- **Port 5000**: The app serves on port 5000 (configurable via `PORT` env var)

<!-- OPENSPEC:START -->
## OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->