# Change: Update website landing page offering

## Why
GitHub Issue #31 specifies a $900 one-time + $100/mo maintenance pricing for landing page creation, but the current "Starter Site" is priced at $1,500 one-time with no recurring component. The issue also requires upselling the web chat agent as an add-on on website inquiry forms to cross-sell AI services.

## What Changes
- Replace "Starter Site" ($1,500) with "Landing Page" ($900 + $100/mo maintenance) in offerings data
- Add `monthlyAddon` optional field to `OfferingItem` type for hybrid one-time + recurring pricing
- Update `OfferingCard` price display to render the secondary monthly line
- Add web chat agent upsell checkbox to `IntakeForm` for website packages
- Update `starter-site` → `landing-page` package ID references in IntakeForm

## Impact
- Affected specs: `offerings-catalog` (MODIFIED — item pricing and type), new capability `website-agent-upsell`
- Affected code: `client/src/data/offerings.ts`, `client/src/pages/offerings.tsx`, `client/src/components/IntakeForm.tsx`
