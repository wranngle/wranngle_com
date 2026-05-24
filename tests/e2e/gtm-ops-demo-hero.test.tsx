/**
 * gtm-ops demo-hero contract tests (F009).
 *
 * Central promise: the /products/gtm-ops ProductScreenshot hero plays REAL
 * recorded prospect-POV walkthroughs of the live ops-console (auto_demo), not
 * static PNGs. This suite asserts every manifest entry is backed by an on-disk
 * .webm + .poster.jpg, the src manifest stays in lockstep with the public
 * manifest the browser fetches, and each slide carries a live-console href.
 *
 * The component itself (ProductScreenshot) renders inside the full gtm-ops
 * page which pulls in heavy embla/motion deps; this suite validates the data
 * contract + asset existence directly, which is what actually breaks when a
 * recording is renamed or dropped.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it, expect} from 'vitest';
import srcManifest from '../../client/src/pages/gtm-ops-demos.manifest.json';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const PUBLIC_MANIFEST = path.join(
  REPO_ROOT,
  'client/public/assets/gtm-ops-demos/manifest.json',
);

type Flow = {
  id: string;
  label: string;
  sub: string;
  video: string;
  poster: string;
  href: string;
};

const flows = srcManifest as Flow[];

describe('gtm-ops demo hero', () => {
  it('ships at least three recorded console walkthroughs', () => {
    expect(flows.length).toBeGreaterThanOrEqual(3);
    expect(flows.map((f) => f.id)).toEqual(['generate', 'evals', 'settings']);
  });

  it('backs every slide with a real on-disk video + poster', () => {
    for (const flow of flows) {
      for (const rel of [flow.video, flow.poster]) {
        const onDisk = path.join(
          REPO_ROOT,
          'client/public',
          rel.replace(/^\//, ''),
        );
        expect(fs.existsSync(onDisk), `missing asset ${rel}`).toBe(true);
        expect(fs.statSync(onDisk).size, `empty asset ${rel}`).toBeGreaterThan(
          1024,
        );
      }
    }
  });

  it('points each slide at the live console route', () => {
    for (const flow of flows) {
      expect(flow.href).toMatch(
        /^https:\/\/app\.wranngle\.com\/console\/\?route=/,
      );
    }
  });

  it('keeps the src manifest in lockstep with the public manifest', () => {
    const pub = JSON.parse(fs.readFileSync(PUBLIC_MANIFEST, 'utf8')) as unknown;
    expect(pub).toEqual(srcManifest);
  });
});
