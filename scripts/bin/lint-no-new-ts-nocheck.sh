#!/usr/bin/env bash
# lint-no-new-ts-nocheck.sh — fail CI if a PR ADDS a `// @ts-nocheck`
# line. 16 existing files are grandfathered (sweep tracked in #52);
# this lint only catches NEW additions so the count drifts down, never up.
#
# Strategy: diff the PR head against the merge-base with origin/main and
# fail if any added line in any file matches /^\+.*@ts-nocheck/. Removed
# lines (existing files getting cleaned up) are fine.
#
# Local usage: `bash scripts/bin/lint-no-new-ts-nocheck.sh`
# CI usage: same; the workflow step calls this directly.

set -euo pipefail

# Default base: origin/main. Override with $BASE_REF for local runs.
base_ref="${BASE_REF:-origin/main}"

# Resolve the merge-base. Fall back to plain origin/main if the local
# clone doesn't have it (shouldn't happen with fetch-depth: 0 in CI).
if ! merge_base="$(git merge-base "$base_ref" HEAD 2>/dev/null)"; then
  echo "lint-no-new-ts-nocheck: cannot resolve merge-base with $base_ref — skipping" >&2
  exit 0
fi

# Collect added lines from the PR diff that contain @ts-nocheck.
# `git diff <merge_base> HEAD` shows changes the PR introduces.
# `--diff-filter=AM` covers added/modified files; deletions are exempt.
# `grep -nE '^\+[^+]'` keeps only added content (skips the +++ header).
added=$(git diff --diff-filter=AM "$merge_base" HEAD -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.mjs' '*.cjs' \
  | awk '
      /^diff --git/ { file=$0; sub(/^diff --git a\//, "", file); sub(/ .*/, "", file); next }
      /^\+\+\+ / { next }
      /^\+/ && /@ts-nocheck/ { print file ": " substr($0, 2) }
    ' || true)

if [[ -n "$added" ]]; then
  echo "lint-no-new-ts-nocheck: this PR adds new @ts-nocheck suppressions:" >&2
  echo "$added" >&2
  echo "" >&2
  echo "  Fix the underlying type errors instead, or scope the suppression" >&2
  echo "  with a per-line @ts-expect-error pointing at the specific issue." >&2
  echo "  Sweep of pre-existing @ts-nocheck files is tracked in #52." >&2
  exit 1
fi

echo "lint-no-new-ts-nocheck: no new @ts-nocheck additions in this PR — clean."
