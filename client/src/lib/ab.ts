/**
 * Cookie-split A/B/C headline framework.
 *
 * Sticky per-browser variant assignment (cookie TTL 30d) + a `report`
 * helper that POSTs to `/api/ticker` so click-through and impression
 * events feed the conversion-funnel telemetry pipeline introduced in
 * #76. Server-side rendering is tolerated — assignment is lazy and
 * happens only when `document` is defined.
 */

export const AB_COOKIE_NAME = 'wrnAbHeadline';
export const AB_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const AB_VARIANTS = ['A', 'B', 'C'] as const;
export type AbVariant = (typeof AB_VARIANTS)[number];

export type AbHeadline = {
  variant: AbVariant;
  headline: string;
  subhead: string;
  cta: string;
};

export const AB_HEADLINES: Record<AbVariant, AbHeadline> = {
  A: {
    variant: 'A',
    headline: 'One AI front door for every customer conversation.',
    subhead:
      'Web chat, voice, Slack, Teams, and Discord \u2014 answered and dispatched.',
    cta: 'Hear it live',
  },
  B: {
    variant: 'B',
    headline: 'Stop losing leads in channels nobody is watching.',
    subhead:
      'Wranngle captures, qualifies, and dispatches the lead \u2014 wherever it lands.',
    cta: 'Run the numbers',
  },
  C: {
    variant: 'C',
    headline: 'Every channel is your storefront. Staff them all with one AI.',
    subhead:
      'A front end trained on your services, your prices, your policies.',
    cta: 'Start Wranngling',
  },
};

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const raw = document.cookie || '';
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }

  return undefined;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return;
  const secure =
    typeof location !== 'undefined' && location.protocol === 'https:'
      ? '; Secure'
      : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`;
}

function pickVariant(): AbVariant {
  // Uniform draw across the three buckets. The bucket count and order
  // are pinned so the cookie value stays stable when this file is
  // edited; if you add a fourth variant, bump the cookie name to
  // force a re-roll instead of stretching the existing distribution.
  const idx = Math.floor(Math.random() * AB_VARIANTS.length);
  return AB_VARIANTS[Math.min(idx, AB_VARIANTS.length - 1)];
}

function isVariant(value: string | undefined): value is AbVariant {
  return value === 'A' || value === 'B' || value === 'C';
}

/**
 * Returns the variant assigned to this browser, persisting a fresh
 * roll to a cookie on first call. Safe to call repeatedly; reads are
 * cheap and assignments are idempotent within a session.
 */
export function getAbVariant(): AbVariant {
  const existing = readCookie(AB_COOKIE_NAME);
  if (isVariant(existing)) return existing;

  const fresh = pickVariant();
  writeCookie(AB_COOKIE_NAME, fresh, AB_COOKIE_MAX_AGE_SECONDS);
  return fresh;
}

/**
 * Force a specific variant (used by tests and the `?ab=` query
 * override for QA). Returns the variant actually written.
 */
export function setAbVariant(variant: AbVariant): AbVariant {
  writeCookie(AB_COOKIE_NAME, variant, AB_COOKIE_MAX_AGE_SECONDS);
  return variant;
}

export function getAbHeadline(variant?: AbVariant): AbHeadline {
  return AB_HEADLINES[variant ?? getAbVariant()];
}

export type AbEventName = 'impression' | 'cta_click' | 'secondary_click';

export type AbEventPayload = {
  event: AbEventName;
  variant: AbVariant;
  surface: string;
  meta?: Record<string, string | number | boolean>;
};

/**
 * Report an A/B event to the funnel-telemetry endpoint introduced in
 * #76. Uses `navigator.sendBeacon` when available so the request
 * survives page unloads triggered by the same click that fired it;
 * falls back to keep-alive fetch. Network errors are swallowed —
 * telemetry must never block the user's click.
 */
export async function reportAbEvent(
  payload: Omit<AbEventPayload, 'variant'> & {variant?: AbVariant},
): Promise<boolean> {
  const variant = payload.variant ?? getAbVariant();
  const body: AbEventPayload = {
    event: payload.event,
    variant,
    surface: payload.surface,
    meta: payload.meta,
  };

  try {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.sendBeacon === 'function'
    ) {
      const blob = new Blob([JSON.stringify(body)], {
        type: 'application/json',
      });
      return navigator.sendBeacon('/api/ticker', blob);
    }

    if (typeof fetch === 'function') {
      await fetch('/api/ticker', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
        keepalive: true,
      });
      return true;
    }
  } catch {
    // Telemetry is best-effort; never throw into the click path.
  }

  return false;
}

/**
 * Returns an onClick handler that fires a `cta_click` ticker event
 * for the variant currently assigned, then invokes the original
 * handler. Designed for drop-in use on hero CTAs.
 */
export function withAbClick<T extends {preventDefault?: () => void}>(
  surface: string,
  inner?: (event: T) => void,
): (event: T) => void {
  return (event: T) => {
    void reportAbEvent({event: 'cta_click', surface});
    inner?.(event);
  };
}
