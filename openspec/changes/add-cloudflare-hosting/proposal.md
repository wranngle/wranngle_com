# Change: Add Cloudflare Hosting

## Why
To enable 100% free, production-grade hosting for the Wranngle Systems website and lead capture API. Currently, the site is self-hosted locally, which lacks 24/7 availability and stability.

## What Changes
- **Backend Refactor**: Replace the Express server with Cloudflare Pages Functions.
- **Data Pipeline**: Replace volatile `MemStorage` with a direct push to the n8n webhook.
- **Frontend Build**: Configure the project for Cloudflare Pages deployment.

## Impact
- **Affected specs**: `hosting`, `api-leads`
- **Affected code**: `server/index.ts` (removed), `server/routes.ts` (refactored), `server/storage.ts` (replaced by n8n)
- **Status**: Research and documentation only (not implemented yet).
