# Change: Add offering categories and dedicated offerings page

## Why
The homepage hardcodes two AI agent pricing tiers with no categorization or dedicated browsable page. Wranngle offers both AI Agent services and Website development, but the current site only surfaces agent pricing inline. A categorized offerings system with a dedicated `/offerings` route improves discoverability and allows the homepage to stay focused while linking to full details.

## What Changes
- Extract hardcoded pricing/offering data from `App.tsx` into a static config module (`client/src/data/offerings.ts`)
- Introduce offering **categories** (AI Agents, Websites) each containing typed offering items
- Create a new `/offerings` page that renders all categories with filtering/navigation
- Refactor the homepage pricing section into a condensed "featured offerings" preview that links to `/offerings`
- Add the `/offerings` route to `Router.tsx`

## Impact
- Affected specs: `landing-page` (MODIFIED — pricing section becomes preview), new spec `offerings-catalog`
- Affected code: `client/src/App.tsx`, `client/src/Router.tsx`, new `client/src/pages/offerings.tsx`, new `client/src/data/offerings.ts`
