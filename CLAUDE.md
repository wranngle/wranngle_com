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
