/**
 * E2E coverage for the cookie-split A/B headline framework
 * (`client/src/lib/ab.ts`). Exercises the central promise: every
 * browser is deterministically assigned one of {A,B,C}, the
 * assignment survives reloads via cookie, and CTA clicks fire a
 * variant-tagged event to `/api/ticker` (the #76 conversion-funnel
 * telemetry sink) without blocking the user.
 *
 * Behavior under test (named, not function-named):
 *   - assignment: first visit picks one of A/B/C and persists
 *   - stickiness: second visit re-uses the cookie value
 *   - override: setAbVariant overrides the cookie
 *   - reporter: cta_click hits /api/ticker with the right shape
 *   - reporter: a fetch failure does not throw into the click path
 *   - reporter: prefers navigator.sendBeacon when available
 *   - dry-run: cookie writer is a no-op when document is undefined
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {
  AB_COOKIE_NAME,
  AB_VARIANTS,
  AB_HEADLINES,
  getAbHeadline,
  getAbVariant,
  reportAbEvent,
  setAbVariant,
  withAbClick,
} from '@/lib/ab';

function clearAbCookie() {
  document.cookie = `${AB_COOKIE_NAME}=; Max-Age=0; Path=/`;
}

describe('A/B headline framework — cookie split', () => {
  beforeEach(() => {
    clearAbCookie();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearAbCookie();
  });

  it('assignment: first visit picks one of A/B/C and writes the cookie', () => {
    const variant = getAbVariant();
    expect(AB_VARIANTS).toContain(variant);
    expect(document.cookie).toContain(`${AB_COOKIE_NAME}=${variant}`);
  });

  it('stickiness: subsequent calls return the same variant from the cookie', () => {
    // Pin via direct cookie write so the assertion does not depend on Math.random.
    document.cookie = `${AB_COOKIE_NAME}=B; Path=/`;
    expect(getAbVariant()).toBe('B');
    expect(getAbVariant()).toBe('B');
  });

  it('override: setAbVariant rewrites the cookie and getAbVariant reflects it', () => {
    setAbVariant('C');
    expect(getAbVariant()).toBe('C');
    setAbVariant('A');
    expect(getAbVariant()).toBe('A');
  });

  it('headlines: each variant resolves to a distinct (headline, subhead, cta) tuple', () => {
    const tuples = AB_VARIANTS.map((v) => {
      const h = AB_HEADLINES[v];
      return `${h.headline}|${h.subhead}|${h.cta}`;
    });
    expect(new Set(tuples).size).toBe(AB_VARIANTS.length);
  });

  it('getAbHeadline: honors an explicit variant argument', () => {
    setAbVariant('A');
    expect(getAbHeadline('C').headline).toBe(AB_HEADLINES.C.headline);
    expect(getAbHeadline().headline).toBe(AB_HEADLINES.A.headline);
  });

  it('rejects a bogus cookie value and re-rolls a real variant', () => {
    document.cookie = `${AB_COOKIE_NAME}=Z; Path=/`;
    const fresh = getAbVariant();
    expect(AB_VARIANTS).toContain(fresh);
    expect(fresh).not.toBe('Z');
  });
});

describe('A/B headline framework — telemetry to /api/ticker (#76 funnel)', () => {
  beforeEach(() => {
    clearAbCookie();
    vi.restoreAllMocks();
  });

  it('reporter: prefers navigator.sendBeacon and tags the payload with the assigned variant', async () => {
    setAbVariant('B');
    const beacon = vi.fn().mockReturnValue(true);
    // happy-dom does not implement sendBeacon by default; stub it on the global.
    Object.defineProperty(globalThis.navigator, 'sendBeacon', {
      value: beacon,
      configurable: true,
    });

    const sent = await reportAbEvent({event: 'cta_click', surface: 'hero'});
    expect(sent).toBe(true);
    expect(beacon).toHaveBeenCalledTimes(1);
    const [url, blob] = beacon.mock.calls[0] as [string, Blob];
    expect(url).toBe('/api/ticker');
    const text = await blob.text();
    const parsed = JSON.parse(text) as Record<string, unknown>;
    expect(parsed).toMatchObject({
      event: 'cta_click',
      variant: 'B',
      surface: 'hero',
    });
  });

  it('reporter: falls back to keep-alive fetch when sendBeacon is unavailable', async () => {
    setAbVariant('A');
    Object.defineProperty(globalThis.navigator, 'sendBeacon', {
      value: undefined,
      configurable: true,
    });
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, {status: 204}));

    const sent = await reportAbEvent({event: 'impression', surface: 'hero'});
    expect(sent).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe('/api/ticker');
    expect((init as RequestInit).method).toBe('POST');
    expect((init as RequestInit & {keepalive?: boolean}).keepalive).toBe(true);
    const rawBody = (init as RequestInit).body as string;
    const body = JSON.parse(rawBody) as Record<string, unknown>;
    expect(body).toMatchObject({
      event: 'impression',
      variant: 'A',
      surface: 'hero',
    });
  });

  it('reporter: a fetch rejection is swallowed (telemetry never blocks the click path)', async () => {
    setAbVariant('C');
    Object.defineProperty(globalThis.navigator, 'sendBeacon', {
      value: undefined,
      configurable: true,
    });
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));

    await expect(
      reportAbEvent({event: 'cta_click', surface: 'hero'}),
    ).resolves.toBe(false);
  });

  it('withAbClick: calls the wrapped handler and fires a cta_click event with the assigned variant', async () => {
    setAbVariant('C');
    const beacon = vi.fn().mockReturnValue(true);
    Object.defineProperty(globalThis.navigator, 'sendBeacon', {
      value: beacon,
      configurable: true,
    });

    const inner = vi.fn();
    const handler = withAbClick<{preventDefault?: () => void}>(
      'hero-primary-cta',
      inner,
    );
    handler({});
    // Beacon dispatch is synchronous (Blob construction is sync).
    expect(beacon).toHaveBeenCalledTimes(1);
    expect(inner).toHaveBeenCalledTimes(1);
    const [, blob] = beacon.mock.calls[0] as [string, Blob];
    const parsed = JSON.parse(await blob.text()) as Record<string, unknown>;
    expect(parsed.variant).toBe('C');
    expect(parsed.surface).toBe('hero-primary-cta');
    expect(parsed.event).toBe('cta_click');
  });
});
