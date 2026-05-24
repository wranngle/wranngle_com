/**
 * Hero demo grid contract tests (R3-F001 hexagonal fish-scale grid).
 *
 * Central promise: the homepage + /products/websites hero shows REAL recorded
 * demos of diverse client landing pages running the actual ElevenLabs widget,
 * composited into a hexagonal fish-scale grid. This suite asserts one <video>
 * per manifest demo (each backed by an on-disk asset), the center focus hex
 * advances deterministically, the circuit tracers render, the vignette and the
 * "Live across client sites" caption are GONE (F001.4 / F001.6), and the
 * src/public manifests stay in lockstep.
 *
 * Drift guard: client/src/components/hero-demos.manifest.json (the typed import
 * the grid renders) MUST equal client/public/assets/hero-demos/manifest.json
 * (the asset URLs the browser fetches), and every referenced .webm + poster
 * must exist on disk.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRoot, type Root} from 'react-dom/client';
import React, {act} from 'react';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import StackedWidgetCarousel from '../../client/src/components/StackedWidgetCarousel.tsx';
import srcManifest from '../../client/src/components/hero-demos.manifest.json';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const PUBLIC_MANIFEST = path.join(
  REPO_ROOT,
  'client/public/assets/hero-demos/manifest.json',
);

type Rendered = {container: HTMLElement; root: Root; cleanup: () => void};

async function renderGrid(): Promise<Rendered> {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(<StackedWidgetCarousel isDark />);
  });
  return {
    container,
    root,
    cleanup() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

function frontVideoSrc(container: HTMLElement): string {
  // The center focus hex is the only tile rendered with aria-hidden="false".
  const front = [...container.querySelectorAll('[aria-hidden="false"]')].find(
    (c) => c.querySelector('video'),
  );
  return front?.querySelector('video')?.getAttribute('src') ?? '';
}

describe('Hero demo grid', () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(
      () => undefined,
    );
    // Pin matchMedia to "motion allowed" so a sibling test file that left a
    // reduced-motion mock in place can't disable the grid's rotation interval
    // (useReducedMotion reads prefers-reduced-motion).
    const noop = () => undefined;
    vi.spyOn(globalThis, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: false,
          media: query,
          addEventListener: noop,
          removeEventListener: noop,
          addListener: noop,
          removeListener: noop,
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders one video per recorded demo, each backed by a real on-disk asset', async () => {
    const {container, cleanup} = await renderGrid();
    try {
      const videos = container.querySelectorAll('video');
      expect(videos.length).toBe(srcManifest.length);
      expect(srcManifest.length).toBeGreaterThanOrEqual(3);

      for (const entry of srcManifest) {
        for (const rel of [entry.video, entry.poster]) {
          const onDisk = path.join(
            REPO_ROOT,
            'client/public',
            rel.replace(/^\//, ''),
          );
          expect(fs.existsSync(onDisk), `missing asset ${rel}`).toBe(true);
          expect(
            fs.statSync(onDisk).size,
            `empty asset ${rel}`,
          ).toBeGreaterThan(1024);
        }
      }

      const manifestVideos = new Set(srcManifest.map((e) => e.video));
      for (const v of container.querySelectorAll('video')) {
        expect(
          manifestVideos.has(v.getAttribute('src') ?? ''),
          'unexpected video src',
        ).toBe(true);
      }
    } finally {
      cleanup();
    }
  });

  it('advances the center focus hex deterministically on the rotation interval', async () => {
    vi.useFakeTimers();
    const {container, cleanup} = await renderGrid();
    try {
      const first = frontVideoSrc(container);
      await act(async () => {
        vi.advanceTimersByTime(5200 + 50);
      });
      const second = frontVideoSrc(container);
      expect(second).not.toBe(first);
      expect(srcManifest.map((e) => e.video)).toContain(second);
    } finally {
      cleanup();
    }
  });

  it('renders hexagonal tiles and center→edge circuit tracers', async () => {
    const {container, cleanup} = await renderGrid();
    try {
      // Hex clip-path tiles: the focus + ring tiles all use the hex polygon.
      const clipped = [...container.querySelectorAll<HTMLElement>('*')].filter(
        (el) => (el.style.clipPath || '').includes('polygon'),
      );
      expect(clipped.length).toBeGreaterThan(3);
      // Six circuit tracer runs, center → each ring-1 node (stable regardless
      // of reduced-motion, which only gates the animated pulse overlay).
      const tracers = container.querySelectorAll('svg g[data-tracer="run"]');
      expect(tracers.length).toBe(6);
    } finally {
      cleanup();
    }
  });

  it('drops the dark vignette and the "Live across client sites" caption', async () => {
    const {container, cleanup} = await renderGrid();
    try {
      expect(container.textContent).not.toContain('Live across client sites');
      expect(container.textContent).not.toContain(
        'agents on real client pages',
      );
      // No full-cover radial-gradient vignette overlay remains.
      const vignette = [...container.querySelectorAll<HTMLElement>('*')].some(
        (el) => (el.style.background || '').includes('radial-gradient'),
      );
      expect(vignette).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('keeps the src manifest in lockstep with the public manifest', () => {
    const pub = JSON.parse(fs.readFileSync(PUBLIC_MANIFEST, 'utf8')) as unknown;
    expect(pub).toEqual(srcManifest);
  });
});
