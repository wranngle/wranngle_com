#!/usr/bin/env bash
# Deploy dist/ to the wranngle-com Cloudflare Pages project (production
# branch main). Pass --build to run `bun run build` first.
#
# Why this exists: `wrangler pages deploy --commit-dirty=true` otherwise
# scrapes the local HEAD commit message and forwards it to the Cloudflare
# deployments API, which rejects messages containing certain non-ASCII
# characters with `APIError 8000111 (Invalid commit message)`. Our commit
# subjects routinely use em-dashes, arrows, ≥, ↔, etc., so the scrape
# broke deploys intermittently. We instead pass an explicit ASCII-only
# --commit-message (sanitized from the subject) plus the real
# --commit-hash, so the dashboard still shows useful provenance.
set -euo pipefail

if [[ "${1:-}" == "--build" ]]; then
  bun run build
fi

hash="$(git rev-parse HEAD 2>/dev/null || true)"
# Keep tab/newline/CR + printable ASCII (0x20-0x7E); drop everything else,
# then cap at 72 chars. Falls back to a static message outside a git tree.
subject="$(git log -1 --format=%s 2>/dev/null || true)"
message="$(printf '%s' "$subject" | LC_ALL=C tr -cd '\11\12\15\40-\176' | cut -c1-72)"
[[ -n "$message" ]] || message="wranngle-com local deploy"

exec npx wrangler pages deploy dist \
  --project-name wranngle-com \
  --branch main \
  --commit-dirty=true \
  ${hash:+--commit-hash="$hash"} \
  --commit-message="$message"
