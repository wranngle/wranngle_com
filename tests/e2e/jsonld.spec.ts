/**
 * Smoke test for per-vertical schema.org/Service JSON-LD.
 *
 * Asserts:
 *   - buildVerticalServiceJsonLd(slug) emits @type=Service with
 *     a serviceArea matching the vertical (HVAC / Plumbing / Roofing).
 *   - mountVerticalServiceJsonLd injects exactly one parseable
 *     <script type="application/ld+json"> into <head>, and the
 *     returned cleanup function removes it again.
 *
 * Playwright is intentionally NOT a dep of this repo; smoke
 * coverage runs through vitest + happy-dom (already configured),
 * which exercises the same contract a Playwright runner would.
 */

import {describe, it, expect, afterEach} from 'vitest';
import {
  buildVerticalServiceJsonLd,
  mountVerticalServiceJsonLd,
  VERTICALS,
  type VerticalSlug,
} from '@/seo/jsonld.ts';

const SLUGS: VerticalSlug[] = ['hvac', 'plumbing', 'roofing'];

afterEach(() => {
  const el = document.head.querySelector('#wranngle-vertical-service-jsonld');
  if (el) el.remove();
});

describe('vertical Service JSON-LD', () => {
  it.each(SLUGS)('builds a valid @type=Service object for %s', (slug) => {
    const v = VERTICALS[slug];
    const ld = buildVerticalServiceJsonLd(slug);

    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('Service');
    expect(ld.serviceArea).toBe(v.serviceArea);
    expect(ld.url).toBe(`https://wranngle.com/verticals/${slug}`);
    expect(ld['@id']).toBe(`${ld.url}#service`);
    expect(ld.provider['@id']).toBe('https://wranngle.com/#organization');
    expect(ld.areaServed['@type']).toBe('Country');
    expect(ld.areaServed.name).toBe('United States');
    expect(ld.name).toContain(v.displayName);
    expect(ld.description.length).toBeGreaterThan(40);
  });

  it('HVAC payload exposes serviceArea exactly equal to "HVAC"', () => {
    // Mirrors the proof clause from 03-feature-plans.md §6 item 3.
    const ld = buildVerticalServiceJsonLd('hvac');
    expect(ld.serviceArea).toBe('HVAC');
  });

  it('mounts exactly one application/ld+json script and cleans up', () => {
    const before = document.head.querySelectorAll(
      'script[type="application/ld+json"]',
    ).length;

    const unmount = mountVerticalServiceJsonLd('hvac');

    const scripts = document.head.querySelectorAll<HTMLScriptElement>(
      'script[type="application/ld+json"]',
    );
    expect(scripts.length).toBe(before + 1);

    const mine = document.head.querySelector<HTMLScriptElement>(
      '#wranngle-vertical-service-jsonld',
    );
    expect(mine).not.toBeNull();
    expect(mine!.type).toBe('application/ld+json');

    // Round-trip parse: the proof says a smoke test parses the JSON-LD.
    const parsed = JSON.parse(mine!.textContent ?? 'null');
    expect(parsed['@type']).toBe('Service');
    expect(parsed.serviceArea).toBe('HVAC');

    unmount();
    expect(
      document.head.querySelector('#wranngle-vertical-service-jsonld'),
    ).toBeNull();
  });

  it('remounting on the same slug does not duplicate the script tag', () => {
    mountVerticalServiceJsonLd('plumbing');
    mountVerticalServiceJsonLd('plumbing');
    const matches = document.head.querySelectorAll(
      '#wranngle-vertical-service-jsonld',
    );
    expect(matches.length).toBe(1);
  });

  it('switching slugs updates the payload in place', () => {
    mountVerticalServiceJsonLd('hvac');
    mountVerticalServiceJsonLd('roofing');
    const el = document.head.querySelector<HTMLScriptElement>(
      '#wranngle-vertical-service-jsonld',
    );
    expect(el).not.toBeNull();
    const parsed = JSON.parse(el!.textContent ?? 'null');
    expect(parsed.serviceArea).toBe('Roofing');
  });
});
