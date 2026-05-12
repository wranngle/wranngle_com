# Project Agent Instructions

## Fast Live Deployment

When the user asks to deploy, publish, ship, or make a finished change live on
the actual app, prefer the direct Cloudflare Pages upload path instead of
waiting for GitHub-triggered Cloudflare builds:

```bash
bun run deploy:live
```

Use `bun run deploy:upload` only when `dist/` is already freshly built from the
current source. The direct path targets the production Pages project
`wranngle-com` on branch `main`.


<!-- dotfiles-import: GEMINI.md sha256:bb9a645e5a9a015ee0410d6262fa53054e017b89224924d3cd663bb241534b09 -->
# Wranngle Systems - Project Context

## Project Overview
This project is the web application and landing page for **Wranngle Systems**, an AI and automation consultancy. It features a distinct "console" aesthetic and integrates an **ElevenLabs Conversational AI** agent.

The application is a full-stack **TypeScript** project structured as a monorepo, utilizing **Express** for the backend and **React** for the frontend, built with **Vite**.

## Tech Stack
- **Language:** TypeScript
- **Runtime:** Bun
- **Frontend:** React, Tailwind CSS, Framer Motion, Radix UI Primitives, Lucide Icons.
- **Backend:** Express.js.
- **Validation:** Arktype.
- **Storage:** In-memory `MemStorage` (implemented in `server/storage.ts`).
- **Build Tooling:** Vite (Frontend), esbuild (Backend bundling).
- **Integrations:** ElevenLabs (`elevenlabs-convai` web component).

## Directory Structure
- **`client/`**: Frontend source code.
  - **`src/App.tsx`**: Main application component containing the landing page layout and logic.
  - **`src/components/ui/`**: Reusable UI components (based on Radix UI).
  - **`src/hooks/`**: Custom React hooks.
- **`server/`**: Backend source code.
  - **`index.ts`**: Entry point. Sets up the Express server and middleware.
  - **`routes.ts`**: API route definitions.
  - **`storage.ts`**: In-memory data storage implementation.
- **`shared/`**: Code shared between client and server.
  - **`schema.ts`**: Data validation schemas using Arktype.
- **`script/`**: Build and utility scripts.
  - **`build.ts`**: Custom build script that handles both client (Vite) and server (esbuild) bundling.

## Development Workflow

### Prerequisites
- Bun runtime

### Key Commands
- **Install Dependencies:** `bun install`
- **Start Development Server:** `bun run dev`
  - Runs the backend with Bun (hot reload) and the frontend via Vite middleware.
  - Access at `http://localhost:5000` (default).
- **Type Checking:** `bun run check` (runs `tsc`)

### Build & Production
- **Build:** `bun run build`
  - Cleans `dist/`.
  - Builds frontend using Vite.
  - Bundles backend using `esbuild` into `dist/index.cjs`.
- **Start Production:** `bun run start`
  - Executes the bundled server: `bun run dist/index.cjs`.

## Architecture & Conventions

### Shared Schema
Data models are defined in `shared/schema.ts`. This file exports Arktype schemas for type safety across the full stack.
- **Example:** `userSchema` and `insertUserSchema`.

### API Routes
- API routes are defined in `server/routes.ts` and registered in `server/index.ts`.
- The backend serves API requests starting with `/api` and falls back to serving the static frontend client for all other routes (in production).

### Frontend Styling
- **Tailwind CSS** is used for styling.
- **Fonts:** Bricolage Grotesque and JetBrains Mono are loaded via Google Fonts.
- **Colors:** Custom brand colors (e.g., `--s500`, `--v500`) are defined in global styles within `App.tsx` or CSS files.

### ElevenLabs Integration
- The conversational agent is embedded using the `<elevenlabs-convai>` custom element.
- **Agent ID:** `agent_7801kqqqhjmcfdsa1m2a8t9w6t5c`.
- The integration script is dynamically injected in `App.tsx`.

<!-- /dotfiles-import: GEMINI.md sha256:bb9a645e5a9a015ee0410d6262fa53054e017b89224924d3cd663bb241534b09 -->


<!-- dotfiles-import: CLAUDE.md sha256:c77ad5460e9cea3009051c66b023d46d55b0e6346d8e3d7187fbdce875204ce9 -->
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies
bun install

# Development (Vite dev server with hot reload)
bun run dev

# Type checking
bun run check

# Lint
bun run lint
bun run lint:fix

# Production build (outputs to dist/)
bun run build

# Preview with Cloudflare Pages Functions
bun run preview

# Deploy to Cloudflare Pages
bun run deploy

# Email Templates
bun run email:build <template-name>      # Build a specific template
bun run email:preview:all                # Generate all preview files
bun run email:test                       # Run validation tests
```

## Architecture

**Static site + Cloudflare Pages Functions** for serverless API:

```
client/          → React frontend (Vite)
├── src/
│   ├── components/ui/   → Shadcn/Radix UI components
│   └── hooks/           → React hooks (use-toast, etc.)
functions/       → Cloudflare Pages Functions (API)
├── api/
│   ├── leads.ts → Lead capture endpoint → n8n webhook
│   └── health.ts → Health check endpoint
shared/          → Shared TypeScript types
└── schema.ts    → ArkType schemas (validation + types)
script/          → Build scripts
└── build.ts     → Vite production build
email-templates/ → Production-ready email system
├── master/      → Master template (header/footer/branding)
├── templates/   → Individual email templates
├── build/       → Template builder and test suite
└── preview/     → Visual preview dashboard
```

**Key architectural patterns:**
- **Serverless API**: Cloudflare Pages Functions handle `/api/*` routes
- **Lead capture**: POSTs to `/api/leads` validate with ArkType and forward to n8n webhook
- **Static hosting**: Cloudflare Pages serves the React SPA globally (free tier)
- **Path aliases**: `@` → `client/src`, `@shared` → `shared` (configured in vite.config.ts and tsconfig)

## Tech Stack

- **Runtime**: Bun (local dev), Cloudflare Workers (production)
- **Frontend**: React, Tailwind CSS, Framer Motion, Radix UI, React Query, wouter
- **Backend**: Cloudflare Pages Functions
- **Validation**: ArkType (not Zod)
- **Linting**: XO with Prettier
- **Build**: Vite

## Deployment

### First-time setup

1. Login to Cloudflare: `npx wrangler login`
2. Deploy: `bun run deploy`
3. Set environment variable in Cloudflare Dashboard:
   - `N8N_WEBHOOK_URL` = your n8n webhook URL for lead capture

### Continuous deployment

Connect GitHub repo to Cloudflare Pages in the dashboard:
- Build command: `bun run build`
- Build output directory: `dist`
- Root directory: `/`

## Important Notes

- **Validation uses ArkType**, not Zod. Schemas defined with `type({...})` syntax
- **No database**: Lead data is forwarded to n8n webhook for processing
- **ElevenLabs widget**: The page embeds `<elevenlabs-convai>` for the AI voice agent demo
- **Environment variables**: Set `N8N_WEBHOOK_URL` in Cloudflare Dashboard
- **Email Templates**: See `email-templates/README.md` for complete documentation. Preview dashboard at `email-templates/preview/index.html`

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

<!-- /dotfiles-import: CLAUDE.md sha256:c77ad5460e9cea3009051c66b023d46d55b0e6346d8e3d7187fbdce875204ce9 -->
