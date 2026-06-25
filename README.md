# wranngle.com

Source for [wranngle.com](https://wranngle.com), the site for Wranngle, an
AI and automation operator lab run by Cody Arnold. It is a React single-page
app deployed to Cloudflare Pages, with a small set of serverless Functions for
lead capture, Stripe checkout, and event telemetry, plus an embedded
ElevenLabs voice agent ("Sarah") as a live demo.

## What it is

- **Marketing site** for voice agents, websites, and a `gtm_ops` proposal
  workflow, with an ROI calculator, an A/B-tested home variant, and a
  founder/about page.
- **Live voice demo.** The ElevenLabs Conversational AI widget is mounted on
  every route ([`GlobalSarahWidget.tsx`](client/src/components/GlobalSarahWidget.tsx)).
  Each route passes a `surface_context` so the agent's opening line matches the
  page. Mic permission required, no signup. The agent's prompt and knowledge
  base live in the ElevenLabs dashboard, not in this repo.
- **Serverless lead capture.** `POST /api/leads` validates input with ArkType,
  sanitizes it, dedupes within a 15-minute window, and forwards to an n8n
  webhook. n8n owns the downstream lead flow.
- **Stripe checkout.** `POST /api/checkout` creates a Stripe Checkout Session
  against the Stripe REST API when `STRIPE_SECRET_KEY` is set, with consent
  collection. `POST /api/stripe-webhook` verifies the Stripe signature and
  forwards paid sessions into the same n8n flow. Both no-op cleanly when the
  secrets are absent.
- **Event telemetry.** `POST /api/events` and `POST /api/ticker` validate
  funnel events and write one structured JSON line per event. Durable storage
  (D1 / Logpush) is not wired yet; lines are readable via `wrangler tail` and
  can be forwarded to a sink without a redeploy.

This is a working personal site, not a multi-tenant SaaS. There is no database
in this repo, no auth, and no customer data store. Wranngle is pre-revenue.

## Tech stack

- **Frontend:** React 18, Vite 7, Tailwind CSS 3, Radix UI / shadcn components,
  Framer Motion, and a react-three-fiber / three.js WebGL hero. Routing via
  `wouter`. TypeScript throughout.
- **Backend:** Cloudflare Pages Functions (`functions/api/`) running on
  Cloudflare Workers.
- **Validation:** ArkType, with shared client/server schemas in `shared/`.
- **Voice:** ElevenLabs ConvAI embed widget, version-pinned.
- **Tooling:** Bun for install / scripts / build, XO for lint, Vitest +
  happy-dom for tests.
- **Hosting:** Cloudflare Pages.

## Getting started

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev        # Vite dev server with hot reload (http://localhost:5173)
bun run check      # TypeScript typecheck
bun run lint       # XO
bun run test       # Vitest
bun run build      # production build -> dist/
bun run preview    # local Cloudflare Pages preview, including Functions
```

### Deploy

```bash
bun run deploy        # deploy dist/ to Cloudflare Pages
bun run deploy:live   # build locally, then upload to the live Pages project
bun run deploy:upload # upload an already-built dist/ without rebuilding
```

### Environment

Functions read their config from Cloudflare Pages environment variables
(Settings -> Environment variables); see [`.env.example`](.env.example).

- `N8N_WEBHOOK_URL` (required for lead capture) and `N8N_WEBHOOK_SECRET`
  (sent as `X-Webhook-Secret`).
- `STRIPE_SECRET_KEY` and `SITE_URL` enable checkout; `STRIPE_WEBHOOK_SECRET`
  enables paid-session fulfillment.
- `ALLOWED_ORIGIN` for CORS.

## Project structure

- `client/` holds the React SPA: pages, components, `lib/`, and ArkType-backed forms.
- `functions/api/` holds the Cloudflare Pages Functions: `leads`, `checkout`,
  `stripe-webhook`, `events`, `ticker`, `health`, and a rate-limiting
  `_middleware`.
- `shared/` holds ArkType schemas and message templates used by both sides.
- `email-templates/` is an HTML email template system: a master template,
  per-type templates, and a Bun build/preview/validation pipeline. The transport
  in `functions/api/send-welcome-email.ts` is a commented reference stub, not a
  wired-up sender.
- `demo-stages/` holds static demo landing pages and recorded flows used to
  capture the product demo videos.
- `script/` and `scripts/` hold build, demo-recording, and ops helper scripts.
- `tests/` holds Vitest unit, e2e (happy-dom), and integration tests. The
  integration suite is gated behind `RUN_LIVE_INTEGRATION=1`.

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the request flow and layer detail.

## License

MIT. See [`LICENSE`](LICENSE).
