# Architecture

`wranngle_com` is the customer-facing site for Wranngle, an AI voice-agent product for busy teams. Static SPA (Vite + React + Tailwind) deployed to Cloudflare Pages, with serverless API routes implemented as Cloudflare Pages Functions.

## Surface

```
   Visitor / lead
        │
        ▼
   ┌────────────────┐       ┌──────────────────────┐
   │ Cloudflare CDN │──────▶│ React SPA            │
   │ (Pages)        │       │ (client/, Vite)      │
   └───────┬────────┘       └──────────┬───────────┘
           │                           │
           │ /api/*                    │ /elevenlabs widget embed
           ▼                           ▼
   ┌──────────────────┐         ┌──────────────────┐
   │ Pages Functions  │         │ ElevenLabs       │
   │ (functions/api/) │         │ ConvAI widget    │
   └─────────┬────────┘         └──────────────────┘
             │
             ▼
   ┌──────────────────┐
   │ wranngle/n8n     │
   │ (lead webhook)   │
   └──────────────────┘
```

## Layers

### `client/` — React SPA (Vite)

Single-page app served as static assets from Cloudflare Pages. Routes (see [`Router.tsx`](client/src/Router.tsx)):

- `/` and `/products/ai-voice-agents` — AI voice-agents home ([`App.tsx`](client/src/App.tsx)). Same component on both; canonical URL is `/`. Carries the polygon-tile hero ([`PolygonTileHero.tsx`](client/src/components/PolygonTileHero.tsx) + the WebGL comet-tracer overlay in [`tileTracers.ts`](client/src/components/tileTracers.ts)), the offerings catalog (consolidated from the former `/offerings` page), FAQ, and a founder note linking to `/about`.
- `/products/websites` — Websites product page ([`pages/websites.tsx`](client/src/pages/websites.tsx)); also embeds the polygon-tile hero.
- `/products/gtm-ops` (alias `/products/gtm_ops`) — gtm_ops SaaS product page ([`pages/gtm-ops.tsx`](client/src/pages/gtm-ops.tsx)).
- `/about` — Wranngle Systems + Cody Arnold ([`pages/about.tsx`](client/src/pages/about.tsx)), portrait, GitHub projects grid, socials. The legacy `/built-by` URL still resolves here.
- `/pricing` — Core/Elite agent pricing ([`routes/pricing.tsx`](client/src/routes/pricing.tsx)).
- `/pilot` — 30-day click-through pilot agreement ([`pages/pilot.tsx`](client/src/pages/pilot.tsx)).
- `/privacy`, `/terms` — legal pages.
- `/offerings` — backcompat redirect to `/#offerings`.
- `/*` — [`not-found.tsx`](client/src/pages/not-found.tsx) (and [`public/404.html`](client/public/404.html) as the Cloudflare static fallback for direct hits to unknown URLs that never enter React).

Routing via `wouter`. The ElevenLabs Sarah widget is mounted once at the Router root by [`GlobalSarahWidget.tsx`](client/src/components/GlobalSarahWidget.tsx) so every SPA route surfaces it; per-route `surface_context` lets the agent prompt branch on which page the caller is on. Brand tokens live in [`client/src/index.css`](client/src/index.css) as HSL variables, mapped from `wranngle/gtm_ops/tokens/`. Tailwind config in [`tailwind.config.ts`](tailwind.config.ts) with shadcn/Radix UI components.

### `functions/api/` — Cloudflare Pages Functions

Serverless API routes (run on Cloudflare Workers in production, locally via `wrangler`):

- [`functions/api/leads.ts`](functions/api/leads.ts) — POST. Validates with ArkType, forwards to `${N8N_WEBHOOK_URL}` for capture.
- [`functions/api/health.ts`](functions/api/health.ts) — GET. Health check.
- [`functions/api/send-welcome-email.ts`](functions/api/send-welcome-email.ts) — POST. Welcome email send via SendGrid.
- [`functions/api/_middleware.ts`](functions/api/_middleware.ts) — CORS + origin validation.

Env vars are bound at runtime via `wrangler` config (Cloudflare Pages dashboard secrets). See [`.env.example`](.env.example) for the required surface.

### `shared/` — Cross-cutting types

[`shared/schema.ts`](shared/schema.ts) — ArkType schemas (NOT Zod) for client/server validation parity.

### `email-templates/` — Production email system

Master template (`master/master-template.html`) + per-template files (`templates/`) + builder (`build/`) + preview dashboard (`preview/`). Email tokens diverge slightly from web (per [`gtm_ops/DESIGN.md`](https://github.com/wranngle/gtm_ops/blob/main/DESIGN.md) — email needs hex literals, not `var(--token)`). See [`email-templates/README.md`](email-templates/README.md).

## Brand system

This repo vendors design tokens from `wranngle/gtm_ops`. The long-form spec is [`gtm_ops/DESIGN.md`](https://github.com/wranngle/gtm_ops/blob/main/DESIGN.md). Token map in `client/src/index.css` (HSL space-separated triplets per shadcn convention).

## Build + deploy

```bash
bun install
bun run dev               # Vite dev server with hot reload
bun run check             # TypeScript typecheck
bun run lint              # XO + Prettier
bun run build             # production build → dist/
bun run preview           # local Cloudflare Pages preview with Functions
bun run deploy            # deploy to Cloudflare Pages
```

CI runs typecheck + lint + build on every PR; gitleaks scans history. See [`.github/workflows/test.yml`](.github/workflows/test.yml). A 30-minute synthetic-lead health check (`.github/workflows/lead-health.yml`) catches the silent-500 class of `/api/leads` failures within one cron window.

## Cross-repo references

- Lead capture flows to [`wranngle/n8n`](https://github.com/wranngle/n8n)'s lead-intake workflow, which also triggers an outbound Sarah call to qualify the lead
- ElevenLabs ConvAI widget routes to the production Sarah agent (also surfaced in [`wranngle/voice_ai_agent_evals`](https://github.com/wranngle/voice_ai_agent_evals) for regression testing)
- `/about` links to all public engineering repos via live GitHub repo cards
