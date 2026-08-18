export type OfferingKind = 'ai-agent' | 'website' | 'saas';

export type PricingTier = {
  monthly: number;
  annualMonthly: number;
  addon?: number;
};

export type OfferingFacts = {
  kind: OfferingKind;
  tierName: string;
  /** 0 means "no annual commitment plan" — popout suppresses the discount UI. */
  discountPercent: number;
  headlinePrice: number;
  annualMonthly: number;
  addon: {price: number; label: string};
  specs: {coverage: string; ingredients: string};
  limits?: {minutes: string; sms: string};
  delivery?: {timeline: string; pages: string; performance: string};
  saasLimits?: {
    proposalsCap: string;
    users: string;
    sso: boolean;
    customDomain: boolean;
    auditChain: string;
  };
  features: string[];
  crossSell?: {label: string; offeringId: string};
  pricing: PricingTier;
};

export type OfferingItem = {
  id: string;
  name: string;
  price: string;
  priceCadence: 'monthly' | 'one-time';
  description: string;
  features: string[];
  badge?: string;
  cta: string;
  monthlyAddon?: {price: string; label: string};
  includesPrevious?: string;
  facts?: OfferingFacts;
};

export type TierPricing = {
  isFree: boolean;
  priceLabel: string;
  priceSuffix: string;
  annualLine?: string;
  addonLine?: string;
};

function formatTierPrice(value: number): string {
  return Number.isInteger(value)
    ? value.toLocaleString('en-US')
    : value.toFixed(2);
}

export function getTierPricing(item: OfferingItem): TierPricing {
  const isFree = item.price === '0';
  const priceLabel = isFree ? 'Free' : `$${item.price}`;
  const priceSuffix = isFree
    ? ''
    : item.priceCadence === 'monthly'
      ? '/mo'
      : ' one-time';

  const {facts} = item;
  const hasDiscount = (facts?.discountPercent ?? 0) > 0 && !isFree;
  const annualLine =
    hasDiscount && facts
      ? `or $${formatTierPrice(facts.annualMonthly)}/mo billed annually · save ${facts.discountPercent}%`
      : undefined;

  let addonLine: string | undefined;
  if (item.monthlyAddon && facts?.kind !== 'saas') {
    const {price, label} = item.monthlyAddon;
    addonLine = label.startsWith('/')
      ? `+ $${price}${label}`
      : `+ $${price}/mo ${label}`;
  }

  return {isFree, priceLabel, priceSuffix, annualLine, addonLine};
}

export type OfferingCategory = {
  id: string;
  name: string;
  description: string;
  items: OfferingItem[];
};

/**
 * STAGE-1 TEAROUT SKELETON (2026-08-15).
 * One product line: a unified, external-facing AI front-end dispatch for
 * sales and customer service across every channel a customer shows up on —
 * web chat, voice, Slack, Teams, Discord. No channel is an add-on and no
 * channel is a tier. The ladder is capability, not channels:
 *
 *   base    = Omni Intake        (all channels, capture + dispatch)
 *   upgrade = Internal AI        (the AI layer that resolves, not just routes)
 *   max     = gtm_ops Platform   (the full go-to-market operations console)
 *
 * Item ids are LOAD-BEARING for /api/checkout and /api/leads package
 * allowlists (basic / premium / gtm-ops-pro) — do not rename ids without
 * touching functions/api/*. Add-ons and annual-discount plumbing are
 * intentionally removed: discountPercent 0 + no monthlyAddon means no
 * extra pricing lines render anywhere.
 */
export const OFFERING_CATEGORIES: OfferingCategory[] = [
  {
    id: 'unified',
    name: 'Unified AI Front End',
    description:
      'One front door for sales and customer service — web chat, voice, Slack, Teams, and Discord land in the same intake, the same dispatch, the same follow-up.',
    items: [
      {
        id: 'basic',
        name: 'Omni Intake',
        price: '250',
        priceCadence: 'monthly',
        description:
          'Every channel answered by one AI front end. It captures who, what, and how urgent, then dispatches to the person or system that owns the next step.',
        cta: 'Start with Omni Intake',
        features: [
          'Web chat, voice, Slack, Teams, and Discord — one front door',
          'Sales and support requests triaged in the same flow',
          'Structured intake record on every conversation',
          'Dispatch to email, CRM, or webhook with full context',
          'Standard support, business-hours response',
        ],
        facts: {
          kind: 'ai-agent',
          tierName: 'Omni Intake',
          discountPercent: 0,
          headlinePrice: 250,
          annualMonthly: 250,
          addon: {price: 0, label: 'no add-ons'},
          pricing: {monthly: 250, annualMonthly: 250},
          specs: {
            coverage: 'All channels, one intake',
            ingredients:
              'Unified channel adapters (web chat, voice, Slack, Teams, Discord), structured intake schema, dispatch routing, transcript + record on every conversation.',
          },
          limits: {minutes: '1,000', sms: '500'},
          features: [
            'Omni-channel front end (chat, voice, Slack, Teams, Discord)',
            'Structured intake + dispatch',
            'Conversation records and transcripts',
            'Standard support',
          ],
          crossSell: {
            label:
              'Upgrade to Internal AI when the front end should resolve requests, not just route them',
            offeringId: 'premium',
          },
        },
      },
      {
        id: 'premium',
        name: 'Internal AI',
        price: '500',
        priceCadence: 'monthly',
        description:
          'The upgrade: an internal AI layer behind the front door that answers from your knowledge, takes real actions in your systems, and closes the loop itself.',
        cta: 'Upgrade to Internal AI',
        includesPrevious: 'Omni Intake',
        features: [
          'Trained on your company knowledge, policies, and pricing',
          'Resolves requests end-to-end, not just intake',
          'Acts in your systems: booking, CRM updates, order lookups',
          'Human handoff with full context when it matters',
          'Priority support',
        ],
        facts: {
          kind: 'ai-agent',
          tierName: 'Internal AI',
          discountPercent: 0,
          headlinePrice: 500,
          annualMonthly: 500,
          addon: {price: 0, label: 'no add-ons'},
          pricing: {monthly: 500, annualMonthly: 500},
          specs: {
            coverage: 'Front end + internal resolution',
            ingredients:
              'Company knowledge base, action tools (booking, CRM, lookups), system integrations, escalation paths, evaluation harness on every prompt change.',
          },
          limits: {minutes: '2,500', sms: '1,500'},
          features: [
            'Everything in Omni Intake',
            'Internal knowledge + action layer',
            'System integrations (booking, CRM, ops)',
            'Priority support',
          ],
          crossSell: {
            label:
              'Go to gtm_ops Platform when intake should become proposals, pipelines, and run logs',
            offeringId: 'gtm-ops-pro',
          },
        },
      },
      {
        id: 'gtm-ops-pro',
        name: 'gtm_ops Platform',
        price: '900',
        priceCadence: 'monthly',
        description:
          'The max tier: the full gtm_ops platform. Every conversation the front end captures becomes enrichment, branded proposals, and a replayable run log.',
        cta: 'Get gtm_ops Platform',
        includesPrevious: 'Internal AI',
        features: [
          'Lead enrichment + branded proposal generation',
          'Replayable run log on every proposal',
          'Team workspaces, SSO, custom domain',
          'Onboarding session included',
        ],
        facts: {
          kind: 'saas',
          tierName: 'gtm_ops Platform',
          discountPercent: 0,
          headlinePrice: 900,
          annualMonthly: 99,
          addon: {price: 0, label: 'no add-ons'},
          pricing: {monthly: 900, annualMonthly: 900},
          specs: {
            coverage: 'Full platform, multi-team',
            ingredients:
              'Enrichment pipeline, branded PDF renderer, run log + replay, SSO, team workspaces, custom domain.',
          },
          saasLimits: {
            proposalsCap: 'Unlimited',
            users: 'Unlimited',
            sso: true,
            customDomain: true,
            auditChain: 'Exportable',
          },
          features: [
            'Everything in Internal AI',
            'Enrichment + proposal generation',
            'Run log with replay',
            'SSO + team workspaces + custom domain',
            'Onboarding session',
          ],
        },
      },
    ],
  },
];

export function getOfferingById(id: string): OfferingItem | undefined {
  for (const cat of OFFERING_CATEGORIES) {
    const item = cat.items.find((i) => i.id === id);
    if (item) return item;
  }

  return undefined;
}

export function getCategoryById(id: string): OfferingCategory | undefined {
  return OFFERING_CATEGORIES.find((c) => c.id === id);
}
