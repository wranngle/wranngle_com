/**
 * Doctrine-drift guard between Router's real routes and the Sarah widget's
 * SURFACE_BY_ROUTE map (GlobalSarahWidget.tsx).
 *
 * Every component-backed route should map to an explicit surface_context
 * so the ElevenLabs agent prompt sees a consistent, canonical context —
 * crucially for alias routes (/built-by → about, /products/gtm_ops →
 * gtm-ops, /products/ai-voice-agents → home) which the map deliberately
 * NORMALIZES. Without an entry, GlobalSarahWidget falls back to
 * `wranngle-com${location}`, leaking the raw alias path to the agent.
 *
 * Adding a route + forgetting its surface entry is the silent drift this
 * catches. Redirect-only routes (e.g. /offerings) are exempt — they never
 * render the widget.
 */

import path from 'node:path';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {describe, it, expect} from 'vitest';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

function routerComponentPaths(): string[] {
  const src = readFileSync(
    path.join(REPO_ROOT, 'client/src/Router.tsx'),
    'utf8',
  );
  // Only <Route path="X" ... component={...}> — redirect routes have no
  // component= and are exempt.
  return [...src.matchAll(/<Route\s+path="([^"]+)"[^>]*\bcomponent=/g)].map(
    (m) => m[1],
  );
}

function surfaceMapKeys(): Set<string> {
  const src = readFileSync(
    path.join(REPO_ROOT, 'client/src/components/GlobalSarahWidget.tsx'),
    'utf8',
  );
  const block = /SURFACE_BY_ROUTE[^{]*{([\s\S]*?)};/.exec(src);
  if (!block) throw new Error('SURFACE_BY_ROUTE map not found');
  return new Set([...block[1].matchAll(/'([^']+)':/g)].map((m) => m[1]));
}

describe('Sarah surface_context drift', () => {
  const routes = routerComponentPaths();
  const surfaces = surfaceMapKeys();

  it('finds the real component routes (regex sanity)', () => {
    expect(routes.length).toBeGreaterThanOrEqual(10);
    expect(routes).toContain('/');
    expect(routes).toContain('/pilot');
  });

  it('maps every component-backed route to an explicit surface_context', () => {
    const missing = routes.filter((r) => !surfaces.has(r)).sort();
    expect(missing).toEqual([]);
  });

  it('has no surface entry for a route that no longer exists', () => {
    // Reverse direction: a stale key in the map (route deleted from Router
    // but its surface entry left behind) is dead config.
    const routeSet = new Set(routes);
    const orphans = [...surfaces].filter((s) => !routeSet.has(s)).sort();
    expect(orphans).toEqual([]);
  });
});
