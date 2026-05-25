/**
 * Doctrine-drift guard for the polygon-tile hero.
 *
 * The set of mock landing-page slugs lives in three places that must stay
 * in lockstep:
 *   1. PolygonTileHero.tsx — STOCK_TILES, the slugs the component renders.
 *   2. client/public/assets/hero-tiles/<slug>.{jpg,thumb.jpg} — the captures
 *      the component points <img> at.
 *   3. client/public/assets/hero-tiles/manifest.json — the generator's
 *      record of what it built.
 *
 * If someone adds a business to the generator but forgets STOCK_TILES, or
 * removes a capture, or renames a slug in one place only, a tile ships a
 * broken image (404) or a capture goes dead. These tests fail the instant
 * those three sources diverge — the cheapest possible catch for a class of
 * bug that is otherwise invisible until a human spots a missing tile.
 */

import path from 'node:path';
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {describe, it, expect} from 'vitest';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const HERO_COMPONENT = path.join(
  REPO_ROOT,
  'client/src/components/PolygonTileHero.tsx',
);
const TILES_DIR = path.join(REPO_ROOT, 'client/public/assets/hero-tiles');
const MANIFEST = path.join(TILES_DIR, 'manifest.json');

/** Slugs the component renders as image tiles (DEMO_TILES use posters under
 *  a different path, so only the `slug:`-keyed STOCK_TILES are extracted). */
function stockTileSlugs(): string[] {
  const src = readFileSync(HERO_COMPONENT, 'utf8');
  const slugs = [...src.matchAll(/\bslug:\s*'([a-z\d-]+)'/g)].map((m) => m[1]);
  return [...new Set(slugs)];
}

type ManifestEntry = {slug: string; full: string; thumb: string};
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as ManifestEntry[];
const manifestSlugs = manifest.map((e) => e.slug).sort();
const componentSlugs = stockTileSlugs().sort();

describe('hero-tiles drift', () => {
  it('renders a non-trivial deck of stock tiles', () => {
    // Guards against the regex silently matching nothing after a refactor.
    expect(componentSlugs.length).toBeGreaterThanOrEqual(30);
  });

  it('ships both a widescreen and a thumb capture for every rendered tile', () => {
    const missing = componentSlugs.filter(
      (slug) =>
        !existsSync(path.join(TILES_DIR, `${slug}.jpg`)) ||
        !existsSync(path.join(TILES_DIR, `${slug}.thumb.jpg`)),
    );
    expect(missing).toEqual([]);
  });

  it('keeps the manifest and the component slug sets identical', () => {
    expect(manifestSlugs).toEqual(componentSlugs);
  });

  it('points every manifest entry at files that exist', () => {
    const broken = manifest.filter(
      (e) =>
        !existsSync(path.join(REPO_ROOT, 'client/public', e.full)) ||
        !existsSync(path.join(REPO_ROOT, 'client/public', e.thumb)),
    );
    expect(broken.map((e) => e.slug)).toEqual([]);
  });

  it('source-biz-images.mjs has a KEYWORDS entry for every slug', () => {
    // If a slug ships in the registry but not in source-biz-images.mjs,
    // the script can never refresh its imagery after a delete — the
    // captures are effectively read-only and orphan from regeneration.
    const sourceScript = readFileSync(
      path.join(REPO_ROOT, 'script/generators/source-biz-images.mjs'),
      'utf8',
    );
    const kwSlugs = new Set(
      [...sourceScript.matchAll(/^\s*'([a-z][a-z\d-]*)':\s*\[/gm)].map(
        (m) => m[1],
      ),
    );
    const missing = componentSlugs.filter((s) => !kwSlugs.has(s));
    expect(missing).toEqual([]);
  });
});
