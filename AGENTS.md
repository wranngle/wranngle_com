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

The application is a **TypeScript** SPA hosted on **Cloudflare Pages**: a React frontend (Vite-built) shipped as a static bundle and a small serverless API layer running on **Cloudflare Pages Functions** under `functions/api/`. There is no long-running backend server.

## Tech Stack
- **Language:** TypeScript.
- **Runtime:** Bun (local dev), Cloudflare Workers (production).
- **Frontend:** React, Tailwind CSS, Framer Motion, Radix UI primitives, Lucide icons, wouter for routing, React Query.
- **Backend:** Cloudflare Pages Functions (serverless), one file per route under `functions/api/`.
- **Validation:** ArkType (not Zod) — `type({...})` syntax in `shared/schema.ts`.
- **Build Tooling:** Vite (single bundler; SSR/prerender of selected routes happens via `script/build.ts`). No backend bundling step — Pages Functions ship as-is.
- **Storage:** No database. Lead data is forwarded to n8n via webhook; events flow through the Pages Functions.
- **Integrations:** ElevenLabs (`<elevenlabs-convai>` web component), n8n (lead/event webhooks), Cloudflare Pages.

## Directory Structure
- **`client/`** — Frontend source code (React SPA).
  - **`src/App.tsx`** — AI voice agents home page (served at `/` and `/products/ai-voice-agents`).
  - **`src/Router.tsx`** — wouter route table + canonical/meta sync.
  - **`src/components/`** — Page-level components (PolygonTileHero, GlobalSarahWidget, etc.).
  - **`src/components/ui/`** — Shadcn/Radix primitives.
  - **`src/pages/`** — Other top-level routes (about, websites, gtm-ops, pilot, etc.).
  - **`src/lib/`** — Shared client helpers (Sarah widget loader, theming, etc.).
  - **`public/`** — Static assets copied verbatim into `dist/`.
- **`functions/`** — Cloudflare Pages Functions (serverless API).
  - **`api/leads.ts`** — Lead capture → ArkType validation → n8n webhook.
  - **`api/health.ts`** — Health check.
  - **`api/stripe-webhook.ts`**, **`api/checkout.ts`**, **`api/events.ts`**, **`api/ticker.ts`**, **`api/send-welcome-email.ts`** — additional endpoints.
  - **`api/_middleware.ts`** — request middleware shared across functions.
- **`shared/`** — Code shared between client and functions.
  - **`schema.ts`** — ArkType schemas.
- **`script/`** — Build + recording + generator scripts.
  - **`build.ts`** — production build (Vite + selected-route prerender).
  - **`record-hero-demos.ts`**, **`record-gtm-ops-demos.ts`** — Playwright recordings.
  - **`generators/`** — mock landing-page generator + capture pipeline.
- **`scripts/`** (plural) — Operational scripts (n8n, SMTP, smoke tests).
- **`demo-stages/`** — Static landing pages used by the recording pipeline.
- **`email-templates/`** — Production email template system.

## Development Workflow

### Prerequisites
- Bun runtime.

### Key Commands
- **Install:** `bun install`
- **Dev server:** `bun run dev` — Vite dev server with HMR on `http://localhost:5173`. Use `bun run dev:functions` to test Pages Functions locally via wrangler.
- **Type-check:** `bun run check` (`tsc`).
- **Lint:** `bun run lint` / `bun run lint:fix` (XO + Prettier).
- **Test:** `bun run test` (Vitest).

### Build & Production
- **Build:** `bun run build` — runs `script/build.ts` which invokes Vite, prerenders the SPA HTML routes listed in `vite.config.ts` (`spaHtmlRoutes`), and writes the bundle to `dist/`. There is no separate backend bundling step.
- **Preview locally:** `bun run preview` — `wrangler pages dev dist` so Functions run against the built bundle.
- **Deploy (fast path):** `bun run deploy:live` — builds then uploads directly to the `wranngle-com` Pages project on `main`. Use this over waiting for GitHub-triggered builds.
- **Re-upload current dist/:** `bun run deploy:upload` — skips the build, useful when `dist/` is already fresh.

## Architecture & Conventions

### Shared Schema
Data models live in `shared/schema.ts` as ArkType schemas — these are the single source of truth shared between the SPA and the Pages Functions.

### API Routes
- Each function is a file under `functions/api/`. The filename maps to the URL: `functions/api/leads.ts` serves `/api/leads`.
- POST handlers validate incoming JSON against an ArkType schema from `shared/schema.ts` and forward to the appropriate webhook (typically n8n).
- All other paths fall through to the React SPA via the Pages static handler.

### Frontend Styling
- **Tailwind CSS** is the styling system.
- **Fonts:** Bricolage Grotesque and JetBrains Mono via Google Fonts.
- **Colors:** Brand colors (`--s500`, `--v500`, etc.) are defined in `client/src/index.css` and consumed via Tailwind utilities.

### ElevenLabs Integration
- The conversational agent is embedded via the `<elevenlabs-convai>` custom element.
- **Agent ID:** `agent_7801kqqqhjmcfdsa1m2a8t9w6t5c` (single source: `SARAH_AGENT_ID` in `client/src/lib/sarah.ts`).
- The widget is mounted globally by `GlobalSarahWidget.tsx` inside `Router.tsx` so every SPA route shows it. The static `client/public/404.html` mirrors the same agent ID + widget version inline (a drift test in `client/src/lib/sarah.test.ts` enforces parity).

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
