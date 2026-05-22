/**
 * /pricing contract test.
 *
 * Renders PricingPage via react-dom/server and asserts the three plan
 * cards exist with data-testids, prices, and CTA buttons. The brief
 * called for Playwright, but the project has no Playwright dependency
 * and "no dep bumps" is a hard constraint. This SSR render exercises
 * the same contract (three cards, prices, CTAs) deterministically.
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {plans} from '@/data/plans.ts';
import PricingPage from '@/routes/pricing.tsx';

// SiteHeader / SiteFooter pull in widget + theme code that touches
// `globalThis.window`. Stub them so the contract test stays focused on
// the pricing surface.
vi.mock('@/components/site/SiteHeader.tsx', () => ({
  default: () => null,
}));
vi.mock('@/components/site/SiteFooter.tsx', () => ({
  default: () => null,
}));
vi.mock('@/components/site/DarkModeToggle.tsx', () => ({
  useDarkMode: () => ({isDark: false, toggle: vi.fn()}),
}));

describe('/pricing route', () => {
  let html: string;

  beforeEach(() => {
    html = renderToStaticMarkup(React.createElement(PricingPage));
  });

  it('renders exactly three plan cards', () => {
    const matches = html.match(/data-testid="plan-card-[a-z]+"/g) ?? [];
    expect(matches).toHaveLength(3);
  });

  it('renders Core Agent, Elite Agent, and Enterprise plan cards', () => {
    expect(html).toContain('data-testid="plan-card-starter"');
    expect(html).toContain('data-testid="plan-card-professional"');
    expect(html).toContain('data-testid="plan-card-enterprise"');
  });

  it('each card has a visible price element', () => {
    for (const plan of plans) {
      expect(html).toContain(`data-testid="plan-card-${plan.slug}-price"`);
      expect(html).toContain(plan.price);
    }
  });

  it('each card has a CTA button with href and label', () => {
    for (const plan of plans) {
      expect(html).toContain(`data-testid="plan-card-${plan.slug}-cta"`);
      expect(html).toContain(plan.ctaLabel);
    }
  });

  it('plans data exposes the required PlanCard shape', () => {
    expect(plans).toHaveLength(3);
    const slugs = plans.map((p) => p.slug);
    expect(slugs).toStrictEqual(['starter', 'professional', 'enterprise']);
    for (const plan of plans) {
      expect(plan.name).toBeTruthy();
      expect(plan.price).toBeTruthy();
      expect(plan.features.length).toBeGreaterThanOrEqual(3);
      expect(plan.ctaLabel).toBeTruthy();
      expect(plan.ctaHref).toBeTruthy();
    }
  });
});
