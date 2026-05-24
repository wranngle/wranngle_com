# R3-F001 — Hexagonal Fish-Scale Infinite Demo Grid

Round-3 redesign of `StackedWidgetCarousel` + `demo-stages`. The stacked deck
with the dark vignette is replaced by a hexagonal fish-scale grid: one focus
tile at center, 2–3 concentric rings peeking behind it, blending outward into
generic fake grid tiles and transparently into the page (no vignette). Pulsing
circuit tracers fan from the center each rotation cycle. Richer multi-step
chats per business with the call button ENABLED.

Branch: `feat/hexagonal-demo-grid` (off `origin/cody/r2-pinchgrab-fixes`, which
already carries the F002 carousel + F009 gtm-ops work).

## Aesthetic direction (per `ui` skill — avoid AI slop)

Commit to a "living circuit / signal-mesh" direction: the brand `--s500`
(#ff5f00 orange) and `--v500` accents as sharp signal colors over the page's
own surface (no new gradient backgrounds, no vignette). Hex tiles read as nodes
on a board; tracers are the signal propagating between them. Motion is one
orchestrated cycle: focus tile ejects forward, a tracer pulse fans out, the
ring rotates, the next tile settles in. Keep the glowing border-tracer language
from F002 but make it cooler/pulsing/patterned (dashed circuit segments, not a
single sweep).

## The 8 requirements — checklist

- [ ] **F001.1 — Less AI/boring landing pages; stock images; differentiate each; use `ui` skill.**
  Rework the 3 demo-stages pages (trattoria/dental/salon) so each has a
  distinct, non-generic visual identity (different type pairing, layout
  rhythm, real photographic imagery via a license-free source baked into
  demo-stages/img/). Not three palette-swaps of one template.
- [ ] **F001.2 — Multi-step rich chat per business showing diverse ElevenLabs capabilities; ENABLE call button (no `override-text-only`; keep `text-input`).**
  Per-business agents get richer prompts + the widget mounts WITHOUT
  `override-text-only` so the mic/call button is live. Keep `text-input` so the
  auto_demo runner can still type + record. Flows drive a 2–3 turn conversation
  exercising a distinct capability each: restaurant = scheduling, dental =
  emergency triage + reschedule, salon = refund/credit + tool lookup.
- [ ] **F001.3 — Stacked deck where top focus card animates OUT from behind the stack each rotation.**
  On each auto-rotation the incoming focus tile starts scaled/translated behind
  the stack and physically animates forward to the focus position (z-pop), the
  outgoing tile recedes back into the ring.
- [ ] **F001.4 — REMOVE the dark vignette entirely; tiles blend transparently/endlessly into the page.**
  Delete the radial-gradient vignette div. Edge tiles fade via per-tile opacity
  falloff (mask/opacity on outer rings), so the grid dissolves into the page
  background with no dark frame.
- [ ] **F001.5 — Hexagonal fish-scale grid: center focus on top, 2–3 concentric layers peeking behind, blend into generic fake grid tiles; revamped glowing tracers — cooler, pulsing, patterned.**
  Axial hex coordinates → pixel positions. Ring 0 = focus (the live demo
  videos). Rings 1–2 = the other real demos + generic "node" tiles (no video,
  just a glowing hex outline + faint UI glyphs). Outer ring = pure decorative
  tiles fading out. Fish-scale overlap: nearer rings paint over farther ones.
- [ ] **F001.6 — Remove "Live across client sites" + "agents on real client pages" captions.**
  Delete the caption strip + `StackedWidgetCarouselBadge` copy (or repurpose).
  Update both call sites (App.tsx, websites.tsx) to drop the now-unused
  caption/subcaption props if the contract changes.
- [ ] **F001.7 — 3D infinite illusion.**
  CSS `perspective` on the container; rings translate in Z (or scale+blur proxy)
  so the mesh recedes into depth. Combined with edge fade → reads as infinite.
- [ ] **F001.8 — Glowing circuit tracers pulse from center fanning out each rotation cycle.**
  On each rotation tick, emit an SVG/CSS pulse that travels along hex-edge
  "circuit" paths from the center node outward to the ring nodes, synced to the
  focus-tile eject.

## Feasibility note (call button enabled)

Removing `override-text-only` makes the widget's voice/call button live (real
prospect could click-to-call). The auto_demo recorder still drives the TYPED
input (`text-input` stays on) — Playwright can't speak, so recordings use text
chat exactly as in F002, but the SHIPPED widget on the demo page now offers the
call button. Quota caveat from F002 still applies (text-LLM characters); each
recorded flow stays at 1–2 complete turns and the quota-error toast stays
CSS-suppressed in the recording stage only.

## Component architecture

`StackedWidgetCarousel.tsx` → rebuilt as `HexDemoGrid` (keep the filename +
default export + `data-testid` so call sites/tests don't break; rename the
component internally). Hex math in a small helper. Props: keep `isDark`; the
`caption`/`subcaption` become optional (F001.6 removes their display) — default
them and stop rendering the strip, so App.tsx/websites.tsx need no change.

## Files

```
demo-stages/{trattoria,dental,salon}/index.html   # richer, differentiated, imagery
demo-stages/img/                                    # baked license-free photos
demo-stages/widget.js                               # drop override-text-only, keep text-input + call btn
demo-stages/flows/*.demo.json                       # multi-step richer scripts
client/public/assets/hero-demos/*.webm + posters    # re-recorded
client/src/components/StackedWidgetCarousel.tsx     # → HexDemoGrid (hex grid, tracers, no vignette)
client/src/components/hero-demos.manifest.json      # regenerated
tests/e2e/hero-carousel.test.tsx                    # updated: hex tiles, no caption, tracer pulse
```

## Verification gate

`bun run check` · `bun run lint` · `bun run vitest run` · `bun run build`, plus
a built-page screenshot of the homepage + /products/websites hero confirming
the hex grid renders with depth, pulsing tracers, no vignette, no captions.

## Scope guard

Only StackedWidgetCarousel.tsx + demo-stages + the record scripts/manifest +
the hero test are mine. App.tsx / websites.tsx only if the props contract must
change (prefer keeping it stable). Do NOT touch gtm-ops.tsx, pricing, FAQ, etc.
