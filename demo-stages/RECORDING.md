# Hero demo recordings

The hex-grid focus tiles play recorded clips of the real ElevenLabs widget on
each demo landing page, produced by the auto_demo Playwright runner.

## Two flow tiers

- `demo-stages/flows/<id>.demo.json` — **default, single-turn.** Quota-light;
  one complete booking exchange per business. These back the currently shipped
  `client/public/assets/hero-demos/*.webm`.
- `demo-stages/flows/rich/<id>.demo.json` — **queued, multi-turn.** Each shows a
  distinct ElevenLabs capability across 2–3 turns:
  - trattoria: scheduling → modify party size + dietary note → confirm
  - dental: emergency triage → insurance lookup → same-day booking
  - salon: refund/credit → formula-on-file lookup → rebook

## Re-record

```bash
bun run script/record-hero-demos.ts          # default single-turn flows
bun run script/record-hero-demos.ts --rich    # rich multi-turn flows
```

Re-run with `--rich` AFTER the ElevenLabs text-LLM quota resets (2026-06-06) or
after the plan is topped up — the rich flows need live agent replies to capture
the full multi-turn media. Authoring the flow files needs no quota; only running
them does. The per-business agents and flows are ready now.
