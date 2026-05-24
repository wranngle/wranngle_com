import {describe, it, expect} from 'vitest';
import {
  OFFERING_CATEGORIES,
  getOfferingById,
  getTierPricing,
} from './offerings.ts';

/**
 * SSOT pricing-display contract (round-2 F006 + F011). TierCard renders
 * every tile on every page through getTierPricing, so these assertions are
 * the single guard that pricing reads identically everywhere.
 */
describe('getTierPricing', () => {
  it('agent tier: monthly headline + annual discount line (per-location addon is spec-sheet only)', () => {
    const core = getOfferingById('basic')!;
    const p = getTierPricing(core);
    expect(p.isFree).toBe(false);
    expect(p.priceLabel).toBe('$250');
    expect(p.priceSuffix).toBe('/mo');
    expect(p.annualLine).toBe('or $212.50/mo billed annually · save 15%');
    // Agents carry no item.monthlyAddon; the per-location price stays on the
    // spec sheet, so the tile shows no addon line (matches prior behavior).
    expect(p.addonLine).toBeUndefined();
  });

  it('free trial: Free label, no suffix, no annual line', () => {
    const trial = getOfferingById('gtm-ops-trial')!;
    const p = getTierPricing(trial);
    expect(p.isFree).toBe(true);
    expect(p.priceLabel).toBe('Free');
    expect(p.priceSuffix).toBe('');
    expect(p.annualLine).toBeUndefined();
  });

  it('website tier: one-time headline + annual maintenance option, no SaaS-style annual line', () => {
    const landing = getOfferingById('landing-page')!;
    const p = getTierPricing(landing);
    expect(p.priceLabel).toBe('$900');
    expect(p.priceSuffix).toBe(' one-time');
    expect(p.annualLine).toBeUndefined(); // websites carry no monthly discount
    expect(p.addonLine).toContain('+ $100/mo maintenance');
    expect(p.addonLine).toContain('/yr (save 17%)');
  });

  it('SaaS tier: shows annual discount line and suppresses the /yr addon line', () => {
    const plus = getOfferingById('gtm-ops-plus')!;
    const p = getTierPricing(plus);
    expect(p.annualLine).toContain('billed annually');
    expect(p.annualLine).toContain('save 17%');
    // SaaS expresses annual via annualLine, never a duplicate addon line.
    expect(p.addonLine).toBeUndefined();
  });

  it('higher tiers declare includesPrevious and never restate lower-tier features', () => {
    const elite = getOfferingById('premium')!;
    expect(elite.includesPrevious).toBe('Core Agent');
    const core = getOfferingById('basic')!;
    // No Elite feature line should duplicate a Core feature line verbatim.
    for (const f of elite.features) expect(core.features).not.toContain(f);

    const pro = getOfferingById('gtm-ops-pro')!;
    expect(pro.includesPrevious).toBe('Plus');
    expect(pro.features).not.toContain('Everything in Plus');
  });

  it('every tier produces a non-empty price label', () => {
    for (const cat of OFFERING_CATEGORIES) {
      for (const item of cat.items) {
        expect(getTierPricing(item).priceLabel.length).toBeGreaterThan(0);
      }
    }
  });
});
