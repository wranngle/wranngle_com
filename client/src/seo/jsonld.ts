/**
 * Vertical landing-route JSON-LD builders.
 *
 * Pairs with the static profile graph in client/index.html
 * (Person + Organization). This module adds per-vertical
 * schema.org/Service objects that the vertical landing routes
 * inject into <head> on mount.
 */

const CANONICAL_ORIGIN = 'https://wranngle.com';
const PROVIDER_ID = `${CANONICAL_ORIGIN}/#organization`;

export type VerticalSlug = 'hvac' | 'plumbing' | 'roofing';

export type VerticalConfig = {
  readonly slug: VerticalSlug;
  readonly displayName: string;
  readonly serviceArea: string;
  readonly serviceType: string;
  readonly description: string;
};

export const VERTICALS: Readonly<Record<VerticalSlug, VerticalConfig>> = {
  hvac: {
    slug: 'hvac',
    displayName: 'HVAC',
    serviceArea: 'HVAC',
    serviceType: 'AI voice agent for HVAC businesses',
    description:
      'AI voice agents for HVAC contractors: 24/7 after-hours call answering, lead capture, and dispatch handoff for heating, ventilation, and air-conditioning service businesses.',
  },
  plumbing: {
    slug: 'plumbing',
    displayName: 'Plumbing',
    serviceArea: 'Plumbing',
    serviceType: 'AI voice agent for plumbing businesses',
    description:
      'AI voice agents for plumbing contractors: emergency call triage, after-hours intake, and qualified-lead routing for residential and commercial plumbing.',
  },
  roofing: {
    slug: 'roofing',
    displayName: 'Roofing',
    serviceArea: 'Roofing',
    serviceType: 'AI voice agent for roofing businesses',
    description:
      'AI voice agents for roofing contractors: storm-event call surge handling, inspection scheduling, and qualified-lead capture for roofing service businesses.',
  },
};

export type ServiceSchema = {
  readonly '@context': 'https://schema.org';
  readonly '@type': 'Service';
  readonly '@id': string;
  readonly name: string;
  readonly serviceType: string;
  readonly serviceArea: string;
  readonly description: string;
  readonly url: string;
  readonly provider: {readonly '@id': string};
  readonly areaServed: {
    readonly '@type': 'Country';
    readonly name: 'United States';
  };
};

export function buildVerticalServiceJsonLd(slug: VerticalSlug): ServiceSchema {
  const v = VERTICALS[slug];
  const url = `${CANONICAL_ORIGIN}/verticals/${v.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: `${v.displayName} AI Voice Agent — Wranngle Systems`,
    serviceType: v.serviceType,
    serviceArea: v.serviceArea,
    description: v.description,
    url,
    provider: {'@id': PROVIDER_ID},
    areaServed: {'@type': 'Country', name: 'United States'},
  };
}

const VERTICAL_SCRIPT_ID = 'wranngle-vertical-service-jsonld';

/**
 * Idempotently mounts (or replaces) a single JSON-LD <script> tag in
 * <head> for the active vertical route. Returns a cleanup function
 * the caller wires to its effect teardown so back-navigation drops
 * the stale Service graph from <head>.
 */
export function mountVerticalServiceJsonLd(slug: VerticalSlug): () => void {
  if (typeof document === 'undefined') return () => undefined;
  const payload = JSON.stringify(buildVerticalServiceJsonLd(slug));
  let el = document.head.querySelector<HTMLScriptElement>(
    `script#${VERTICAL_SCRIPT_ID}`,
  );
  if (!el) {
    el = document.createElement('script');
    el.id = VERTICAL_SCRIPT_ID;
    el.type = 'application/ld+json';
    // eslint-disable-next-line unicorn/prefer-dom-node-append -- .append in TS DOM typings infers Response/ReadableStream, breaks tsc; existing Router.tsx uses appendChild for the same reason.
    document.head.appendChild(el);
  }

  el.textContent = payload;
  return () => {
    const live = document.head.querySelector<HTMLScriptElement>(
      `script#${VERTICAL_SCRIPT_ID}`,
    );
    if (live) live.remove();
  };
}
