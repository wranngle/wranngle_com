import {describe, it, expect} from 'vitest';
import {
  OFFERING_CATEGORIES,
  getOfferingById,
  getTierPricing,
} from './offerings.ts';

/**
 * SSOT pricing-display contract. TierCard renders every tile through
 * getTierPricing, so these assertions are the single guard that pricing
 * reads identically everywhere: three tiers, monthly-only, no annual
 * lines, no add-on lines.
 */
describe('getTierPricing', () => {
  it('base tier: monthly headline, no annual line, no addon line', () => {
    const base = getOfferingById('basic')!;
    const p = getTierPricing(base);
    expect(p.isFree).toBe(false);
    expect(p.priceLabel).toBe('$250');
    expect(p.priceSuffix).toBe('/mo');
    expect(p.annualLine).toBeUndefined();
    expect(p.addonLine).toBeUndefined();
  });

  it('upgrade tier: $500/mo, monthly-only', () => {
    const upgrade = getOfferingById('premium')!;
    const p = getTierPricing(upgrade);
    expect(p.priceLabel).toBe('$500');
    expect(p.priceSuffix).toBe('/mo');
    expect(p.annualLine).toBeUndefined();
    expect(p.addonLine).toBeUndefined();
  });

  it('max tier: $900/mo, monthly-only', () => {
    const max = getOfferingById('gtm-ops-pro')!;
    const p = getTierPricing(max);
    expect(p.priceLabel).toBe('$900');
    expect(p.priceSuffix).toBe('/mo');
    expect(p.annualLine).toBeUndefined();
    expect(p.addonLine).toBeUndefined();
  });

  it('ladder: exactly one category with the three tiers in base→max order', () => {
    expect(OFFERING_CATEGORIES).toHaveLength(1);
    const ids = OFFERING_CATEGORIES[0].items.map((i) => i.id);
    expect(ids).toEqual(['basic', 'premium', 'gtm-ops-pro']);
    const prices = OFFERING_CATEGORIES[0].items.map((i) =>
      Number(i.price.replace(',', '')),
    );
    expect(prices).toEqual([250, 500, 900]);
  });

  it('higher tiers declare includesPrevious and never restate lower-tier features', () => {
    const upgrade = getOfferingById('premium')!;
    expect(upgrade.includesPrevious).toBe('Omni Intake');

    const max = getOfferingById('gtm-ops-pro')!;
    expect(max.includesPrevious).toBe('Internal AI');
    expect(max.features).not.toContain('Everything in Internal AI');
  });

  it('every tier is a monthly subscription with no monthlyAddon', () => {
    for (const item of OFFERING_CATEGORIES[0].items) {
      expect(item.priceCadence).toBe('monthly');
      expect(item.monthlyAddon).toBeUndefined();
      expect(item.facts?.discountPercent).toBe(0);
    }
  });
});
