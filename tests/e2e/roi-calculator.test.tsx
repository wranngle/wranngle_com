/**
 * ROI calculator contract test.
 *
 * Three concerns:
 *   1. Pure formula in `@/lib/roi.ts` is deterministic and edge-safe.
 *   2. SSR-rendered RoiCalculator surfaces the seeded company name and
 *      a numeric `data-savings-monthly` attribute, matching the
 *      brief's required selector.
 *   3. The telemetry side-effect fires exactly one `/api/ticker` POST
 *      per settled input, with the expected payload shape.
 *
 * Project has no @testing-library/react and lockfile changes are
 * out-of-scope for this PR, so we mirror PR #73's pricing.spec.ts
 * approach: react-dom/server for markup assertions, react-dom/client
 * + happy-dom for the telemetry-fire test (vitest already wires
 * happy-dom in vitest.config.ts).
 */

import React, {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import RoiCalculator from '@/components/RoiCalculator.tsx';
import {computeRoi, ROI_ASSUMPTIONS} from '@/lib/roi.ts';

// React 18 marks createRoot tests as needing this flag. happy-dom + vitest
// otherwise prints a noisy console.error on every render.
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('roi formula', () => {
  it('matches the documented assumptions on the canonical input', () => {
    const r = computeRoi({
      company: 'Bella Vista Trattoria',
      calls: 80,
      ticket: 350,
    });
    // 80 * 0.35 * 0.95 * 0.40 = 10.64 jobs * $350 = $3,724
    expect(r.missedCallsMonthly).toBeCloseTo(28, 0);
    expect(r.additionalJobsBooked).toBeCloseTo(10.6, 1);
    expect(r.savingsMonthly).toBe(3724);
    expect(r.paybackMonths).toBeGreaterThan(0);
  });

  it('returns all zeros on zero calls — no NaN, no Infinity', () => {
    const r = computeRoi({company: '', calls: 0, ticket: 350});
    expect(r.missedCallsMonthly).toBe(0);
    expect(r.recoveredCallsMonthly).toBe(0);
    expect(r.additionalJobsBooked).toBe(0);
    expect(r.savingsMonthly).toBe(0);
    expect(r.paybackMonths).toBe(0);
  });

  it('sanitizes negative and non-finite inputs to zero', () => {
    const r = computeRoi({company: 'X', calls: -10, ticket: Number.NaN});
    expect(r.savingsMonthly).toBe(0);
    expect(Number.isFinite(r.paybackMonths)).toBe(true);
  });

  it('exposes immutable assumption constants', () => {
    expect(ROI_ASSUMPTIONS.MISSED_CALL_RATE).toBe(0.35);
    expect(Object.isFrozen(ROI_ASSUMPTIONS)).toBe(true);
  });
});

describe('RoiCalculator SSR markup', () => {
  it('surfaces seeded company name in the heading', () => {
    const html = renderToStaticMarkup(
      <RoiCalculator
        isDark={false}
        initialCompany="Bella Vista Trattoria"
        initialCalls={80}
        initialTicket={350}
        autoRotate={false}
      />,
    );
    expect(html).toContain('Bella Vista Trattoria');
  });

  it('renders the data-savings-monthly attribute on the output element', () => {
    const html = renderToStaticMarkup(
      <RoiCalculator
        isDark={false}
        initialCompany="Bella Vista Trattoria"
        initialCalls={80}
        initialTicket={350}
        autoRotate={false}
      />,
    );
    // 80 * 0.35 * 0.95 * 0.40 = 10.64 jobs * $350 = $3,724 (rounded)
    expect(html).toMatch(/data-savings-monthly="3724"/);
  });

  it('renders an roi section anchor for in-page navigation', () => {
    const html = renderToStaticMarkup(
      <RoiCalculator isDark={false} initialCalls={0} initialTicket={0} />,
    );
    expect(html).toContain('id="roi"');
    expect(html).toContain('data-testid="roi-calculator"');
  });
});

describe('RoiCalculator telemetry', () => {
  let container: HTMLDivElement | undefined;
  let root: Root | undefined;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchSpy = vi.fn().mockResolvedValue(new Response('{}', {status: 202}));
    globalThis.fetch = fetchSpy;
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    container = undefined;
    root = undefined;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('fires one POST to /api/ticker with the roi.calculated payload', () => {
    if (!container) throw new Error('container missing');
    act(() => {
      root = createRoot(container!);
      root.render(
        <RoiCalculator
          isDark={false}
          initialCompany="Bella Vista Trattoria"
          initialCalls={80}
          initialTicket={350}
          autoRotate={false}
        />,
      );
    });

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('/api/ticker');
    expect(init?.method).toBe('POST');
    const payload = JSON.parse(init?.body as string);
    expect(payload).toEqual({
      event: 'roi.calculated',
      company: 'Bella Vista Trattoria',
      calls: 80,
      ticket: 350,
      savings_monthly: 3724,
    });
  });
});

describe('RoiCalculator scenario rotation (F005)', () => {
  let container: HTMLDivElement | undefined;
  let root: Root | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response('{}', {status: 202}));
    // happy-dom reports prefers-reduced-motion: reduce, which would disable
    // the rotation entirely. Force it off so these tests exercise the real
    // auto-advance + pause behavior rather than the reduced-motion still.
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    container = undefined;
    root = undefined;
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const activeWordmarkId = () =>
    document.querySelector<HTMLElement>('[data-testid="roi-wordmark"]')?.dataset
      .wordmarkId ?? '';
  const companyInput = () =>
    document.querySelector<HTMLInputElement>(
      '[data-testid="roi-input-company"]',
    );

  it('auto-advances to the next mock scenario when left alone', () => {
    if (!container) throw new Error('container missing');
    act(() => {
      root = createRoot(container!);
      root.render(<RoiCalculator isDark={false} />);
    });
    // First scenario shows the trattoria lockup.
    expect(activeWordmarkId()).toBe('trattoria');

    // Fire the dwell interval — advances to scenario 2 and re-renders the
    // wordmark with the dental id.
    act(() => {
      vi.advanceTimersByTime(5100);
    });
    act(() => {
      vi.advanceTimersByTime(60 * 60);
    });
    expect(activeWordmarkId()).toBe('dental');
    // The dental tier renders as a real inline-SVG logo lockup (its own
    // letterforms + monogram tile + gradient + accent stripe — not a font
    // swap on a span). The wordmark wrapper carries data-wordmark-id, and
    // an actual <svg> child must be present.
    const wordmark = document.querySelector<HTMLElement>(
      '[data-testid="roi-wordmark"]',
    );
    expect(wordmark, 'roi-wordmark wrapper').not.toBeNull();
    expect(wordmark!.dataset.wordmarkId).toBe('dental');
    const svg = wordmark!.querySelector('svg');
    expect(svg, 'lockup SVG').not.toBeNull();
    // Sanity: the lockup contains its own letterforms rendered as <text>
    // inside the SVG, and a non-trivial number of shapes (the monogram
    // tile, tooth glyph, accent drop, wordmark text, sub-label, stripe).
    const textNodes = svg!.querySelectorAll('text');
    expect(textNodes.length).toBeGreaterThanOrEqual(2);
    const shapeCount = svg!.querySelectorAll(
      'rect, path, circle, ellipse, line, polygon',
    ).length;
    expect(shapeCount).toBeGreaterThanOrEqual(4);
  });

  it('stops rotating for good once the visitor focuses a field', () => {
    if (!container) throw new Error('container missing');
    act(() => {
      root = createRoot(container!);
      root.render(<RoiCalculator isDark={false} />);
    });

    act(() => {
      // React 18+ delegates focus through `focusin` on the root, not the
      // legacy non-bubbling `focus` event. Dispatch focusin so onFocus fires.
      companyInput()?.dispatchEvent(new Event('focusin', {bubbles: true}));
      vi.advanceTimersByTime(0);
    });
    // Plenty of time for several would-be rotations.
    act(() => {
      vi.advanceTimersByTime(5000 * 3);
    });
    // Rotation surrendered: the per-business SVG lockup is gone (the
    // heading is back to the brand-gradient fallback text). No wordmark id
    // reappears no matter how long we wait.
    expect(activeWordmarkId()).toBe('');
    // The visitor-typed input still reflects the seeded scenario-0 company.
    expect(companyInput()!.value).toContain('Bella Vista');
  });
});
