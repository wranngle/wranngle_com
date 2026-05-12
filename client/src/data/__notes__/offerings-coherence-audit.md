# Offerings Coherence Audit

Date: 2026-05-03
Reviewer: agent (Claude Opus 4.7)
Files reviewed: `client/src/data/offerings.ts`, `client/src/components/AgentFactsPopout.tsx`, `client/src/components/IntakeForm.tsx`, `client/src/components/site/MegaMenu.tsx`, `client/src/App.tsx`, `shared/schema.ts`.

## Per-tier scorecards

Scoring rubric (1–5): tile/spec-sheet alignment · pricing-ladder logic · upsell clarity · form-fit · tone-fit-to-type. Higher = better.

### Pre-audit

| Tier | Align | Ladder | Upsell | Form | Tone | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Core Agent | 4 | 2 | 4 | 4 | 3 | Decent tile/popout, but `addon: 250` is identical to Elite — no per-location ladder. Tone is "voice + after hours"; no uptime / training-data emphasis. |
| Elite Agent | 4 | 2 | 2 | 4 | 4 | Strong "Most Popular" framing. Cross-sell to a website is missing; the form celebrates the choice but never suggests a site. `addon: 250` ladder collapsed. |
| Landing Page | 1 | 1 | 4 | 3 | 2 | **Critical mismatch**: tile says `$900 one-time` + `$100/mo maintenance`; popout reuses AI-Agent labels ("Voice Coverage", "Voice Minutes 1,000") with `n/a` placeholders, calls itself "AI Agent Facts", and prices the BIG monthly figure at $100 (the maintenance fee), so the popout headline price contradicts the tile. Discount % is 0 but still rendered. |
| Business Site | 1 | 2 | 3 | 3 | 2 | Same popout-mismatch. Tile shows `$3,500 one-time` with no maintenance ladder visible (Landing Page has $100/mo, Business Site has nothing). Popout fields read "Voice Coverage: Up to 5 pages + CMS" — incoherent. |

### Post-audit

| Tier | Align | Ladder | Upsell | Form | Tone | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Core Agent | 5 | 4 | 5 | 5 | 5 | Tile copy now leads with "always-on receptionist" + uptime; addon ladder $250 → $200/loc (volume discount logic). Form upsell to Elite preserved. |
| Elite Agent | 5 | 4 | 5 | 5 | 5 | Tile leads with "every channel, never sleeps". New cross-sell hint on form: a Landing Page pairs with the agent. Per-location addon $400 (premium tier costs more to operate). |
| Landing Page | 5 | 5 | 5 | 5 | 5 | Tile reframed as project + monthly maintenance. New `WebsiteFactsPopout`-style spec sheet with project-specific labels (Delivery, Pages, Performance budget, Conversion features). Tile badge "Quickstart" anchors below Business Site. Cross-sell: add Web Chat Agent. |
| Business Site | 5 | 5 | 5 | 5 | 5 | Tile shows `$3,500 + $250/mo maintenance` (laddered above Landing Page's $100/mo). Popout uses website labels. Cross-sell: Core Agent on form. |

## Top 10 changes

1. **Type-aware spec sheet** — `OfferingFacts` now carries `kind: 'ai-agent' | 'website'` and `AgentFactsPopout` branches labels/rows. Websites get "Project Delivery" / "Pages & Scope" / "Performance Budget" rows; AI agents keep "Voice Coverage" / "Voice Minutes" / "SMS Segments". Header title swaps to "Website Spec Sheet" for project work. **Why**: the popout was rendering `n/a` minutes for websites and titling itself "AI Agent Facts" — a credibility-destroying detail for a consulting firm's product menu.
2. **Pricing-display fix on Website tiles** — Pre: tile $900 one-time, popout $100/mo. Post: popout shows project price ($900 / $3,500) prominently, maintenance fee as a separate sub-line. **Why**: tile and popout disagreeing on the price is the most damaging coherence break a buyer can hit.
3. **Per-location addon ladder** — Core $200/extra location (volume discount), Elite $400/extra location (premium service costs more to operate). Pre: both $250 — no ladder, decoy effect lost. **Why**: real consulting firms ladder addons.
4. **Maintenance ladder on websites** — Landing Page $100/mo, Business Site $250/mo. Pre: Business Site had no maintenance line. **Why**: ongoing relationship needs ongoing pricing. Larger sites cost more to maintain.
5. **Tile-copy rewrites for tone-fit-to-type** — AI-Agent tiles emphasize uptime, voice quality, training data, never-sleeping. Website tiles emphasize delivery timeline, conversion, ownership. **Why**: AI agents are subscription/recurring and websites are project + maintenance — they should not speak in the same register.
6. **Cross-sell on Elite form** — A Landing Page or Web Chat suggestion now appears in the Elite Agent intake (was: only "Elite Agent Secured" badge). **Why**: useful placement for a website upsell; a buyer who just chose the $500/mo agent has demonstrated capacity.
7. **Cross-sell on Business Site form** — A Core Agent suggestion ("Pair with a 24/7 voice agent so the contact form isn't your only after-hours capture") now appears. Pre: only Web Chat Agent upsell. **Why**: voice + web is the highest-converting combo, and Business Site buyers are already spending big.
8. **Popout discount-row hidden when 0%** — Websites no longer render "0% Annual" badge or annual-discount line. **Why**: the badge is meaningless for project work and hurts credibility.
9. **Mega-menu category headers** — Offerings column now grouped "AI Agents" and "Websites" with sub-headers; previously a flat list. **Why**: helps the eye, signals breadth, makes upsell category obvious.
10. **Landing Page badge "Quickstart"** — Anchors below the "Best Value" Business Site badge. Pre: no badge. **Why**: decoy effect — a labeled cheap option makes the pricier option look like an easy step up, not a cliff.

## Pricing ladder before/after

| Item | Pre | Post |
| --- | --- | --- |
| Core monthly | $250 | $250 (unchanged) |
| Core addon (extra location) | $250 | $200 |
| Elite monthly | $500 | $500 (unchanged) |
| Elite addon (extra location) | $250 | $400 |
| Annual discount Core | 15% | 15% (unchanged) |
| Annual discount Elite | 20% | 20% (unchanged) |
| Landing Page project | $900 | $900 (unchanged) |
| Landing Page maintenance | $100/mo | $100/mo (unchanged) |
| Business Site project | $3,500 | $3,500 (unchanged) |
| Business Site maintenance | $0 (missing) | $250/mo |
| Web Chat Agent addon (in Website intake) | $250/mo | $250/mo (unchanged) |

## Open punch list (not fixed in this pass)

- **No bundle SKU**: a "Frontier Bundle" SKU (Elite Agent + Business Site, ~$4,500 + $750/mo with a discount) would create a third price-anchor. Out of scope this pass — would require new tier in `OFFERING_CATEGORIES` and matching schema entry.
- **Schema string `package` is freeform**: `insertLeadSchema.package: 'string'` accepts anything. A literal-union (`'basic' | 'premium' | 'landing-page' | 'business-site'`) would catch typos at the API boundary. Skipped — needs n8n side coordination.
- **No live testimonials/case-study row** on offerings cards — premium positioning would benefit, but the user explicitly forbade fake testimonials and there is no real case-study material to pull from yet.
- **Talk-to-Sarah CTA does not preselect tier** when user enters intake from Sarah conversation. Out of scope — depends on widget event hooks.
- **Mega-menu "Best Value" label uses violet** but "Most Popular" inside tile uses violet too — same colour for two semantically different badges. Lower priority; flagged.
