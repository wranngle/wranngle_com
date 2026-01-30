# Tasks

1. [x] Add `monthlyAddon` optional field to `OfferingItem` type in `client/src/data/offerings.ts`
2. [x] Replace "Starter Site" item with "Landing Page" (id: `landing-page`, price: `900`, monthlyAddon: `{price: '100', label: 'maintenance'}`) in offerings data
3. [x] Update "Landing Page" features list: Custom responsive design, Mobile-first build, SEO fundamentals, Contact form integration, Cloudflare hosting, Monthly maintenance & security updates
4. [x] Update `OfferingCard` price display in `client/src/pages/offerings.tsx` to render `monthlyAddon` line when present
5. [x] Replace `starter-site` package references with `landing-page` in `IntakeForm.tsx`
6. [x] Update IntakeForm upsell: `landing-page` → `business-site` upgrade text
7. [x] Add web chat agent upsell checkbox block for website packages (`landing-page`, `business-site`) in IntakeForm
8. [x] Verify `bun run check` passes (type checking)
9. [x] Verify `bun run lint` passes
10. [x] Visual verification: dev server shows correct pricing on offerings page
