/**
 * Determinism / idempotency guard for the demo landing-page generator.
 *
 * #128 fixed a Math.random() in the clinical template that drifted the
 * committed HTML on every regeneration. This locks that in: the pure
 * template functions must be referentially transparent (same business →
 * byte-identical HTML), and statYears must be a stable slug→[20,34] hash.
 * If anyone reintroduces Math.random()/Date.now() into a template, the
 * idempotency assertion below fails.
 *
 * Imports the generator's pure exports — the file-writing side effect is
 * behind a CLI main-guard, so importing it here writes nothing.
 */

import {describe, it, expect} from 'vitest';
import {
  BUSINESSES,
  LAYOUTS,
  statYears,
  renderBusiness,
} from '../../script/generators/biz-landing-pages.mjs';

describe('biz landing-page generator determinism', () => {
  it('renders every business byte-identically across repeated calls', () => {
    for (const b of BUSINESSES) {
      expect(renderBusiness(b)).toBe(renderBusiness(b));
    }
  });

  it('every layout template is referentially transparent', () => {
    const sample = BUSINESSES[0];
    for (const tpl of Object.values(LAYOUTS)) {
      expect(tpl(sample)).toBe(tpl(sample));
    }
  });

  it('statYears is a stable hash in [20, 34]', () => {
    for (const b of BUSINESSES) {
      const a = statYears(b.slug);
      const c = statYears(b.slug);
      expect(a).toBe(c);
      expect(a).toBeGreaterThanOrEqual(20);
      expect(a).toBeLessThanOrEqual(34);
    }
  });

  it('clinical pages embed their deterministic statYears value', () => {
    // Locks the HTML ↔ formula coupling: the rendered clinical stat-card
    // must show exactly statYears(slug), not a random draw.
    const clinical = BUSINESSES.filter((b) => b.layout === 'clinical');
    expect(clinical.length).toBeGreaterThan(0);
    for (const b of clinical) {
      const html = renderBusiness(b);
      expect(html).toContain(`${statYears(b.slug)} yrs`);
    }
  });
});
