# Hero Demo Carousel — Implementation Plan

Round-2 rebuild of the homepage + `/products/websites` hero. Replaces the
placeholder `StackedWidgetCarousel` (static CSS mock cards + baked text bubbles)
with a stack of **real recorded demos**: diverse fake-client landing pages, each
running the **actual `<elevenlabs-convai>` widget**, chatted with by the
`auto_demo` Playwright recorder, composited into a vignetted, glowing-tracer,
auto-lapping carousel that reads as extending infinitely into the background.

Branch: `feat/hero-demo-carousel` (isolated worktree at `/tmp/wcom-hero-demo`).
Main worktree is being edited concurrently by the orchestrator — all work here.

## Source-of-truth facts established before coding

- **auto_demo** (`~/projects/auto_demo`, npm `ui-demo-runner`): Playwright recorder.
  - CLI: `node dist/cli.js run <flow>.demo.json --output <dir> [--base-url URL] [--speed N]`.
  - Flow schema (`src/types.ts`): `{name, startUrl, viewport, record:{enabled,size}, timing, polish, metadata, steps[]}`.
  - Step actions: `goto|click|caption|fill|focus|hover|press|resetZoom|screenshot|scroll|pause|zoom|waitForSelector|waitForText`.
  - Relative `startUrl` resolves against the flow-file dir; `--base-url` resolves relatives against a local dev server.
  - Output per run: `recording.webm`, `manifest.json`, `screenshots/<name>.png`.
- **ElevenLabs widget** (`@elevenlabs/convai-widget-embed@0.12.2`, the pinned version): inspected the real 1.4MB bundle. Observed attributes include:
  `override-text-only`, `text-input`, `default-expanded`, `always-expanded`,
  `transcript`, `dynamic-variables`, `override-prompt`, `override-first-message`,
  `override-voice-id`, `override-language`, `avatar-orb-color-1/2`, `placement`,
  `variant`. **`override-text-only` + `text-input` + `default-expanded` is the
  automatable combination** — the widget opens already-expanded in text-chat
  mode, exposing a typed `<textarea>`/input that Playwright can fill + submit.
- **ElevenLabs REST API**: `POST https://api.elevenlabs.io/v1/convai/agents/create`,
  header `xi-api-key`. Live-verified auth with the local key. Existing Sarah agent
  config shape confirmed via `GET /v1/convai/agents/{id}` — top-level
  `conversation_config.agent.{prompt,first_message,language}` +
  `conversation_config.tts.voice_id`. Response returns `agent_id`.

## Feasibility resolution for vision clause #3 ("clicked and chatted to legit")

Playwright cannot speak audio into the widget — voice input requires a real mic
stream. **Resolution (MVP that preserves intent):** render each client widget in
**text-only chat mode** (`override-text-only` + `text-input` + `default-expanded`)
and have `auto_demo` drive a genuine typed conversation: it types a caller line,
submits, waits for the agent's streamed reply text to appear in the transcript,
then types the next line. This is a **real round-trip against the real agent**
(not a faked bubble) — the widget connects, the agent LLM responds, and the
exchange is captured on video. To avoid per-recording network flakiness/latency
breaking determinism, each flow also carries a scripted fallback (the widget's
text mode renders our `override-first-message` + we drive turns with explicit
`waitForText` on expected reply tokens, with generous `timeoutMs`). If the live
agent round-trip is unavailable at record time, the flow degrades to driving the
widget UI states (expand → type → send → typing indicator) so the recording
still shows the real widget being operated, just without a live LLM reply — and
this degradation is logged, not silent.

## The 7 vision requirements — checklist (all delivered)

Agent ids created via API: trattoria `agent_1201ksb6296reyc97dxn9ngfkx79`,
dental `agent_1401ksb62bc8fa189cnstym17dma`, salon `agent_1501ksb62c8xevxvswp451hj7ykz`.

- [x] **R1. ≥3 diverse fake-client landing pages, professional.**
  Build 3 static HTML landing pages under `demo-stages/` (NOT React routes — they
  must be servable standalone for the recorder and must not ship in the SPA
  bundle). Verticals: (1) **Bella Vista Trattoria** — restaurant reservations,
  (2) **Tidewater Family Dental** — dental same-day booking, (3) **Atlas Hair Co.**
  — salon rebooking. Each: hero, nav, CTA, service grid, footer — real-looking,
  brand-distinct palette, responsive. Single shared CSS, per-page brand vars.
  Decision rationale: static pages are the closest match to "find a basic
  professional landing page builder repo tool" without adding a heavyweight
  dependency for an MVP; they record deterministically with `--base-url` against
  a throwaway static server.

- [x] **R2. Each renders a REAL `<elevenlabs-convai>` widget.**
  Each landing page embeds the actual web component via the same pinned embed
  script (`@elevenlabs/convai-widget-embed@0.12.2`) the production site uses,
  pointed at that page's own agent id, in `override-text-only` + `text-input` +
  `default-expanded` mode with brand-matched orb colors.

- [x] **R3. Widget driven by auto_demo (real chat), not faked.**
  Per the feasibility resolution above. One `*.demo.json` flow per page under
  `demo-stages/flows/`, each: load page → wait for widget mounted → focus widget
  → type caller line into the text input → submit → waitForText agent reply →
  repeat 2–3 turns → screenshot. Captions narrate the beat. Real round-trip.

- [x] **R4. Recorded into video/screenshots.**
  Run each flow with `ui-demo-runner` → `recording.webm` + poster screenshot.
  Store curated assets in `client/public/assets/hero-demos/<id>.webm` +
  `<id>.poster.jpg`. A repeatable `script/record-hero-demos.ts` orchestrates:
  serve `demo-stages/`, run all 3 flows, copy + transcode outputs into public.

- [x] **R5. Composited into a stacked, auto-lapping, infinite-vignette carousel.**
  Rebuild `StackedWidgetCarousel.tsx`: each card is a looping muted `<video>`
  (poster fallback) of one recorded demo, stacked with scale/blur/opacity step-
  back, auto-advancing front card, radial vignette fading the deck into the page.

- [x] **R6. Retain glowing border tracer.**
  Keep the existing SVG `motion.path` stroke-dash tracer on the front card —
  same visual language, re-used verbatim against the new card geometry.

- [x] **R7. MVP, polished, factory-demo-on-rails feel.**
  Deterministic recordings, consistent framing, brand-matched, no over-build.

## Props contract (must not break call sites)

`App.tsx` and `pages/websites.tsx` both call:
`<StackedWidgetCarousel isDark caption subcaption />`. Keep that exact contract.
`StackedWidgetCarouselBadge` export is also consumed — preserve it.

## File map

```
demo-stages/
  shared.css                     # base landing-page styles + brand-var hooks
  widget.js                      # shared convai embed loader (text-only mode)
  trattoria/index.html
  dental/index.html
  salon/index.html
  flows/
    trattoria.demo.json
    dental.demo.json
    salon.demo.json
  agents.json                    # snapshot of created agent ids (NOT source of truth)
script/
  create-hero-agents.ts          # POST /convai/agents/create x3 (idempotent by name)
  record-hero-demos.ts           # serve demo-stages, run 3 flows, publish assets
client/public/assets/hero-demos/
  trattoria.webm  trattoria.poster.jpg
  dental.webm     dental.poster.jpg
  salon.webm      salon.poster.jpg
  manifest.json                  # {id, brand, tagline, agentId, caption} x3
client/src/components/StackedWidgetCarousel.tsx   # rebuilt to composite real media
tests/e2e/hero-carousel.test.tsx                  # central-promise + render test
```

## Agent strategy

Create 3 dedicated agents via API (one per vertical) so each card has a genuinely
matching agent (vision: "make some matching elevenlabs agents"). Idempotent:
the script lists agents, reuses one matching the target name, else creates it.
Each agent gets a short vertical-specific system prompt + first_message + a TTS
voice. Cloud is source of truth; `agents.json` is a snapshot only. Agent ids are
baked into each landing page's widget `agent-id` at record time and recorded in
the public `manifest.json`.

## Test strategy (one file, central promise first)

`tests/e2e/hero-carousel.test.tsx`:
1. **Central promise**: carousel renders N cards each backed by a `<video>` whose
   `src` resolves to a real asset listed in the public `manifest.json`, with a
   poster fallback. (The product promise: real recorded demos in the hero.)
2. Front card advances deterministically over time (fake timers).
3. Glowing tracer present on the front card only.
4. Props contract honored (caption/subcaption render; badge export renders).
Drift guard: the component's card list is derived from
`client/public/assets/hero-demos/manifest.json`, and the test asserts every
manifest entry has a matching on-disk `.webm` + `.poster.jpg` — one coupling,
one test, catches a renamed/missing asset.

## Verification gate (must all be green before reporting done)

`bun run check` · `bun run lint` · `bun run vitest run` · `bun run build`.
Plus a manual frame check of each recorded `.webm` poster.

## gtm-ops follow-up (out of primary scope)

If budget remains after the homepage carousel is green: extend the same
recorded-demo approach to the gtm-ops `ProductScreenshot` hero (round-2 F009),
reusing `auto_demo` against the gtm_ops console. Otherwise: noted here as the
single follow-up, not started.
