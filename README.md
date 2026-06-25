# PinchGrab

A local Chrome/Edge extension that turns a UI element into structured context for a review agent. Hold `Alt` to outline elements, `Alt+Click` to capture, and the page, selectors, accessibility data, and a screenshot land in a JSONL bundle you can hand to an LLM.

[![CI](https://github.com/wranngle/pinchgrab/actions/workflows/ci.yml/badge.svg)](https://github.com/wranngle/pinchgrab/actions/workflows/ci.yml)

![Alt+Click on any element drops a JSONL capture into the side panel](docs/hero.gif)

> Personal tool, built and used by one developer. Loaded unpacked, not published to any store. No telemetry, no server, no external users. Captures stay on disk.

## What it captures

Each `Alt+Click` writes one JSONL row describing the clicked element:

- **Selectors** the agent can replay against a live page: a short unique CSS path, an XPath, a `jsPath`, and the DOM breadcrumb. The CSS builder filters Tailwind and CSS-in-JS hash classes, then trims interior path segments while keeping the selector unique.
- **Framework context** when present: React fiber, Vue vnode, Lit, Stencil, Svelte, and plain web components are sniffed for component name and source file.
- **Accessibility signals**: computed role, accessible name, ARIA state, tab index, and editable/required/disabled flags.
- **Page header**: URL, route, viewport, color scheme, reduced-motion, direction, zoom, and a few recent DOM mutations for repro context.
- **Visuals**: matched CSS rules, the box model, computed styles, and an optional cropped screenshot via `chrome.tabs.captureVisibleTab`.

You can type a comment beside any capture; it rides along in the same row as `feedback`.

## Install

```bash
bun install
bun run build
```

Then load the unpacked build:

1. Open `chrome://extensions` or `edge://extensions`.
2. Turn on Developer mode.
3. Click **Load unpacked** and pick the repo's `extension/` folder.
4. Pin PinchGrab, open a page, hold `Alt` to outline, `Alt+Click` to capture.

`Alt+drag` rubber-bands a region and captures every element inside it. The side panel lists captures, holds comments, and drives exports.

## Export

The side panel writes captures under `Downloads/pinchgrab/<workspace>/`. A workspace export is a `.tar.zst` archive (the tar encoder and zstd frame writer are pure TypeScript, see `src/tar.ts`) containing:

- `<workspace>.jsonl` — one manifest row, then page, selector, and feedback rows
- `README.md` — what the bundle is and how to read it
- `repair-index.md` — a triage punch list for the agent to start from
- `screenshots.json` — uid-keyed index of captures and pages
- `schema.json` — JSON Schema (draft 2020-12) for every row type
- `duckdb.sql` — copy-and-paste SQL recipes for querying the JSONL with DuckDB
- screenshot PNGs when captured

The older standalone capture schema lives at [docs/capture-schema.json](docs/capture-schema.json), with samples in [docs/capture-sample.jsonl](docs/capture-sample.jsonl).

## Replay and recipe utilities

A set of Node scripts work on a capture JSONL after the fact:

```bash
bun run replay            # resolve every capture against a live page (CSS -> XPath -> a11y fallback)
bun run replay:multi      # replay across multiple URLs
bun run export:playwright  # emit a Playwright script from the captures
bun run export:puppeteer   # emit a Puppeteer script
bun run export:english     # emit a plain-English, step-by-step recipe
bun run visual-diff        # diff two capture sets
bun run network-capture    # capture/replay network rows
bun run annotator          # annotate capture steps
```

`bin/pinchgrab replay <capture.jsonl> <url>` opens the URL in headless Chromium and locates every captured element through the CSS -> XPath -> accessibility-name fallback chain. It exits 0 only when every entry resolves to exactly one element, and `--auth-state <storage.json>` loads a Playwright storage state so authenticated captures replay on logged-in pages. Entries rescued by a non-CSS strategy get logged to a healing ledger so you can see which selectors are drifting.

## Develop

```bash
bun run build        # bundle src/*.ts -> extension/*.js with Bun
bun run watch        # rebuild on change
bun run typecheck    # tsc --noEmit
bun run lint         # xo
bun run test         # full suite: typecheck, lint, Playwright specs, legacy export/replay tests
bun run test:fast    # quicker subset
bun run devserver    # static server for the test pages
```

CI runs typecheck, lint, the Playwright and legacy test suites, plus shellcheck, yamllint, actionlint, and a gitleaks scan.

## Layout

- `src/` — TypeScript extension source (content script, side panel, background) and the `.mjs` replay/export utilities.
- `extension/` — the built unpacked extension you load into the browser.
- `bin/` — the `pinchgrab` replay CLI.
- `tests/` — Playwright specs and the legacy export/replay test suite, with JSONL fixtures.
- `scripts/` — build and repo automation.
- `docs/` — capture schema, sample JSONL, and the hero gif.

`.agents/`, `lib/`, and parts of `scripts/bin/` are vendored from the author's dotfiles for local agent and Git tooling. They are not part of the extension and are not needed to build or run it.

## License

MIT. See [LICENSE](LICENSE).
