/**
 * Hero demo carousel contract tests.
 *
 * Central promise (round-2 F002/F013): the homepage + /products/websites
 * hero shows REAL recorded demos of diverse client landing pages running the
 * actual ElevenLabs widget — not CSS mocks. This suite asserts the carousel
 * renders one <video> per manifest entry, each <video> points at an asset that
 * actually exists on disk (the recording pipeline ran), the deck auto-advances
 * the front card, and the glowing border tracer is present on exactly one card.
 *
 * Drift guard: the runtime manifest TypeScript imports
 * (client/src/components/hero-demos.manifest.json) MUST stay in lockstep with
 * the public manifest the browser fetches asset URLs from
 * (client/public/assets/hero-demos/manifest.json), and every referenced
 * .webm + .poster.jpg MUST exist. A renamed or missing asset fails here before
 * it ships a broken hero.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRoot, type Root} from 'react-dom/client';
import React, {act} from 'react';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import StackedWidgetCarousel, {
  StackedWidgetCarouselBadge,
} from '../../client/src/components/StackedWidgetCarousel.tsx';
import srcManifest from '../../client/src/components/hero-demos.manifest.json';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const PUBLIC_DIR = path.join(REPO_ROOT, 'client/public/assets/hero-demos');
const PUBLIC_MANIFEST = path.join(PUBLIC_DIR, 'manifest.json');

type Rendered = {container: HTMLElement; root: Root; cleanup: () => void};

async function renderCarousel(): Promise<Rendered> {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <StackedWidgetCarousel
        isDark
        caption="Live across client sites"
        subcaption="Agents on real client pages, booking the next step."
      />,
    );
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

function videoSrcs(container: HTMLElement): string[] {
  return [...container.querySelectorAll('video')].map(
    (v) => v.getAttribute('src') ?? '',
  );
}

describe('Hero demo carousel', () => {
  beforeEach(() => {
    // HTMLMediaElement.play is unimplemented in happy-dom; stub it so the
    // front-card autoplay effect does not throw.
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(
      () => undefined,
    );
    // happy-dom returns a zero-size rect; the tracer SVG path only renders
    // once the container reports real dimensions, so feed it a layout box.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 480,
      height: 480,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 480,
      bottom: 480,
      toJSON: () => ({}),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders one video per recorded demo, each backed by a real asset', async () => {
    const {container, cleanup} = await renderCarousel();
    try {
      const videos = container.querySelectorAll('video');
      expect(videos.length).toBe(srcManifest.length);
      expect(srcManifest.length).toBeGreaterThanOrEqual(3);

      for (const entry of srcManifest) {
        const file = entry.video.replace(/^\//, '');
        const onDisk = path.join(REPO_ROOT, 'client/public', file);
        expect(fs.existsSync(onDisk), `missing asset ${file}`).toBe(true);
        expect(fs.statSync(onDisk).size, `empty asset ${file}`).toBeGreaterThan(
          1024,
        );
      }

      // Every rendered <video> src is a manifest video URL.
      const manifestVideos = new Set(srcManifest.map((e) => e.video));
      for (const src of videoSrcs(container)) {
        expect(manifestVideos.has(src), `unexpected video src ${src}`).toBe(
          true,
        );
      }
    } finally {
      cleanup();
    }
  });

  it('auto-advances the front card on the deck interval', async () => {
    vi.useFakeTimers();
    const {container, cleanup} = await renderCarousel();
    try {
      const frontVideo = () => {
        // The front card is the one rendered with the glow tracer svg present.
        const cards = [...container.querySelectorAll('[aria-hidden="false"]')];
        const front = cards.find((c) => c.querySelector('video'));
        return front?.querySelector('video')?.getAttribute('src') ?? '';
      };

      const first = frontVideo();
      await act(async () => {
        vi.advanceTimersByTime(6500 + 50);
      });
      const second = frontVideo();
      expect(second).not.toBe(first);
      expect(srcManifest.map((e) => e.video)).toContain(second);
    } finally {
      cleanup();
    }
  });

  it('shows the glowing border tracer on exactly one (front) card', async () => {
    const {container, cleanup} = await renderCarousel();
    try {
      const tracers = container.querySelectorAll('svg path[stroke-dasharray]');
      expect(tracers.length).toBe(1);
    } finally {
      cleanup();
    }
  });

  it('honors the props contract (caption + subcaption + badge)', async () => {
    const {container, cleanup} = await renderCarousel();
    try {
      expect(container.textContent).toContain('Live across client sites');
      expect(container.textContent).toContain(
        'Agents on real client pages, booking the next step.',
      );
      expect(
        container.querySelector('[data-testid="stacked-widget-carousel"]'),
      ).not.toBeNull();
    } finally {
      cleanup();
    }

    const badgeRoot = createRoot(document.createElement('div'));
    await act(async () => {
      badgeRoot.render(<StackedWidgetCarouselBadge />);
    });
    act(() => {
      badgeRoot.unmount();
    });
  });

  it('keeps the src manifest in lockstep with the public manifest', () => {
    const pub = JSON.parse(fs.readFileSync(PUBLIC_MANIFEST, 'utf8')) as unknown;
    expect(pub).toEqual(srcManifest);
    for (const entry of srcManifest as Array<{poster: string}>) {
      const poster = path.join(
        REPO_ROOT,
        'client/public',
        entry.poster.replace(/^\//, ''),
      );
      expect(fs.existsSync(poster), `missing poster ${entry.poster}`).toBe(
        true,
      );
    }
  });
});
