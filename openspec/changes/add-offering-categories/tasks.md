## 1. Data Layer
- [ ] 1.1 Create `client/src/data/offerings.ts` with typed offering categories and items (AI Agents: Core & Elite tiers; Websites: packages TBD)
- [ ] 1.2 Define TypeScript types for `OfferingCategory`, `OfferingItem`, `PricingTier` in the same file

## 2. Offerings Page
- [ ] 2.1 Create `client/src/pages/offerings.tsx` — full page rendering all categories with cards per offering
- [ ] 2.2 Add category navigation/filtering (anchor links or tabs per category)
- [ ] 2.3 Maintain console aesthetic — terminal-styled cards, monospace typography, accent colors
- [ ] 2.4 Include CTA per offering that opens the intake form modal

## 3. Homepage Refactor
- [ ] 3.1 Replace inline `PRICING_PACKAGES` / `FACTS_DATA` in `App.tsx` with imports from `offerings.ts`
- [ ] 3.2 Condense the pricing section to show 1-2 featured offerings with a "View All Offerings →" link to `/offerings`

## 4. Routing
- [ ] 4.1 Add `/offerings` route to `Router.tsx`

## 5. Validation
- [ ] 5.1 Run `bun run check` — no type errors
- [ ] 5.2 Run `bun run lint` — no lint errors
- [ ] 5.3 Manual visual check of homepage preview and `/offerings` page
