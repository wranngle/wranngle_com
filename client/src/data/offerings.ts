export type OfferingKind = 'ai-agent' | 'website' | 'saas';

export type PricingTier = {
  monthly: number;
  annualMonthly: number;
  /** Per-location (AI agents) or unused (websites). */
  addon?: number;
};

export type OfferingFacts = {
  /** Drives spec-sheet rendering: voice/SMS labels for AI agents, project/perf labels for websites, seat/proposal labels for SaaS. */
  kind: OfferingKind;
  tierName: string;
  /** 0 means "no annual commitment plan" — popout suppresses the discount UI. */
  discountPercent: number;
  /** Headline price. For AI agents this is monthly subscription; for websites this is one-time project cost; for SaaS it is monthly SaaS price (0 for trial). */
  headlinePrice: number;
  /** Annual-commitment monthly equivalent (AI agents + SaaS). Set equal to headlinePrice for websites or trial. */
  annualMonthly: number;
  /** Per-location addon (AI agents), maintenance fee (websites), or seat/usage addon (SaaS). */
  addon: {price: number; label: string};
  specs: {coverage: string; ingredients: string};
  /** Voice/SMS limits for AI agents. Empty/undefined for websites + SaaS. */
  limits?: {minutes: string; sms: string};
  /** Website-only: project delivery facts. */
  delivery?: {timeline: string; pages: string; performance: string};
  /** SaaS-only: subscription plan facts. proposalsCap is a string so values like 'Unlimited' or '5 / mo (trial)' render cleanly. */
  saasLimits?: {
    proposalsCap: string;
    users: string;
    sso: boolean;
    customDomain: boolean;
    auditChain: string;
  };
  features: string[];
  /** Cross-sell hint shown on the spec sheet itself (under Marketing Ingredients). */
  crossSell?: {label: string; offeringId: string};

  // Backwards-compat: keep `pricing` shape for any legacy consumers.
  // Prefer `headlinePrice` / `annualMonthly` / `addon` going forward.
  pricing: PricingTier;
};

export type OfferingItem = {
  id: string;
  name: string;
  /** Tile-displayed price (string for formatting like "3,500"). */
  price: string;
  /** Whether `price` is a recurring monthly fee or a one-time project cost. */
  priceCadence: 'monthly' | 'one-time';
  description: string;
  features: string[];
  badge?: string;
  cta: string;
  monthlyAddon?: {price: string; label: string};
  facts?: OfferingFacts;
};

export type OfferingCategory = {
  id: string;
  name: string;
  description: string;
  items: OfferingItem[];
};

export const OFFERING_CATEGORIES: OfferingCategory[] = [
  {
    id: 'ai-agents',
    name: 'AI Agents',
    description:
      'Always-on voice + web + SMS agents. Trained on your trade. Monthly cancellable; annual plans save up to 20%.',
    items: [
      {
        id: 'basic',
        name: 'Core Agent',
        price: '250',
        priceCadence: 'monthly',
        description:
          'Always-on voice receptionist. Captures the leads that hit voicemail today, without ringing your cell at 2am.',
        cta: 'Get Core Agent',
        features: [
          '24/7 voice answering on a forwarded line',
          'Trade-specific training (HVAC, plumbing, electrical, roofing…)',
          'Lead scoring + qualification',
          'SMS notification to your phone within minutes of a call',
          'Email lead capture with caller transcript',
          'Standard support, business-hours response',
        ],
        facts: {
          kind: 'ai-agent',
          tierName: 'Core',
          discountPercent: 15,
          headlinePrice: 250,
          annualMonthly: 212.5,
          addon: {price: 200, label: '/mo per extra location'},
          pricing: {monthly: 250, annualMonthly: 212.5, addon: 200},
          specs: {
            coverage: 'After-hours + overflow',
            ingredients:
              'NATURAL LANGUAGE PROCESSING, LEAD SCORING ALGORITHM, TWILIO VOICE STACK, SHARED SMS POOL, ONE-WAY NOTIFICATIONS, TRADE-SPECIFIC TRAINING DATA.',
          },
          limits: {minutes: '1,000', sms: '500'},
          features: [
            'Voice agent (single channel)',
            'Service-call detection',
            'Lead scoring & qualification',
            'One-way SMS notify (shared pool)',
            'Forwarding to your mobile on hot leads',
            'Trade-specific training data',
            'Standard support',
          ],
          crossSell: {
            label:
              'Pair with a Landing Page so callers convert before they call',
            offeringId: 'landing-page',
          },
        },
      },
      {
        id: 'premium',
        name: 'Elite Agent',
        price: '500',
        priceCadence: 'monthly',
        description:
          'Voice + web chat + two-way SMS, 24/7. Cal.com booking, custom voice, and a unified inbox so nothing falls through.',
        badge: 'Most Popular',
        cta: 'Get Elite Agent',
        features: [
          'Triple-channel: voice, web chat, two-way SMS',
          '24/7/365 priority coverage',
          'ElevenLabs custom voice identity',
          'Cal.com calendar booking from within the call',
          'Direct transfer to a human if requested',
          'Unified inbox across channels',
          'Priority support, 4-hour response',
        ],
        facts: {
          kind: 'ai-agent',
          tierName: 'Elite',
          discountPercent: 20,
          headlinePrice: 500,
          annualMonthly: 400,
          addon: {price: 400, label: '/mo per extra location'},
          pricing: {monthly: 500, annualMonthly: 400, addon: 400},
          specs: {
            coverage: '24/7/365 priority',
            ingredients:
              'ELEVENLABS NEURAL VOICE, DUAL-AGENT ON-CALL LOGIC, CAL.COM BOOKING SYNC, 10DLC COMPLIANT TWO-WAY SMS, UNIFIED INBOX ENGINE, SUB-500MS P95 LATENCY TARGET.',
          },
          limits: {minutes: '2,500', sms: '1,500'},
          features: [
            'Voice + web chat + two-way SMS',
            'Dual-agent on-call routing',
            'Lead qualification with custom playbooks',
            'Two-way SMS on a dedicated number',
            'Cal.com booking integration',
            'Unified inbox across channels',
            'Priority support',
          ],
          crossSell: {
            label:
              'Most Elite buyers add a Business Site so the agent has a home to send leads',
            offeringId: 'business-site',
          },
        },
      },
    ],
  },
  {
    id: 'websites',
    name: 'Websites',
    description:
      'Built once, owned by you, maintained monthly. Project + maintenance — yours to take and host elsewhere any time.',
    items: [
      {
        id: 'landing-page',
        name: 'Landing Page',
        price: '900',
        priceCadence: 'one-time',
        description:
          'One conversion-focused page, shipped in 7 days. Mobile-first, SEO-foundations, contact form wired straight to your inbox.',
        badge: 'Quickstart',
        cta: 'Start Landing Page',
        monthlyAddon: {price: '100', label: 'maintenance'},
        features: [
          'One-page custom design, delivered in 7 days',
          'Mobile-first responsive build',
          'SEO foundations (sitemap, OG tags, robots)',
          'Contact form wired to email + n8n webhook',
          'Cloudflare global CDN hosting',
          'Source code is yours — no platform lock-in',
          'Optional $100/mo maintenance + security updates',
        ],
        facts: {
          kind: 'website',
          tierName: 'Landing Page',
          discountPercent: 0,
          headlinePrice: 900,
          annualMonthly: 900,
          addon: {price: 100, label: '/mo maintenance (optional)'},
          pricing: {monthly: 100, annualMonthly: 100, addon: 900},
          specs: {
            coverage: 'One-page conversion surface',
            ingredients:
              'VITE BUNDLER, MOBILE-FIRST BREAKPOINTS, CLOUDFLARE PAGES CDN, ARKTYPE FORM VALIDATION, N8N LEAD WEBHOOK, CORE WEB VITALS BUDGET, SOURCE CODE OWNERSHIP.',
          },
          delivery: {
            timeline: '7 days',
            pages: '1 page',
            performance: 'Lighthouse 95+',
          },
          features: [
            'Custom responsive design',
            'Mobile-first build',
            'SEO foundations (sitemap + robots + OG tags)',
            'Contact form → n8n webhook',
            'Cloudflare global CDN',
            'Source code ownership (Git handoff)',
            'Optional monthly maintenance',
          ],
          crossSell: {
            label:
              'Add a Web Chat Agent so the page captures leads after hours, too',
            offeringId: 'premium',
          },
        },
      },
      {
        id: 'business-site',
        name: 'Business Site',
        price: '3,500',
        priceCadence: 'one-time',
        description:
          'Up to 5 pages, headless CMS, analytics, lead-capture automation. Shipped in 3 weeks. Owned by you.',
        badge: 'Best Value',
        cta: 'Start Business Site',
        monthlyAddon: {price: '250', label: 'maintenance'},
        features: [
          'Up to 5 pages with custom design',
          'Headless CMS (you edit copy without us)',
          'Privacy-first analytics dashboard',
          'Lead capture → n8n automation pipeline',
          'Lighthouse 90+ performance budget',
          'Cloudflare hosting (first year included)',
          'Source code ownership (Git handoff)',
          '$250/mo maintenance + content support',
        ],
        facts: {
          kind: 'website',
          tierName: 'Business Site',
          discountPercent: 0,
          headlinePrice: 3500,
          annualMonthly: 3500,
          addon: {price: 250, label: '/mo maintenance + content support'},
          pricing: {monthly: 250, annualMonthly: 250, addon: 3500},
          specs: {
            coverage: 'Up to 5 pages + headless CMS',
            ingredients:
              'VITE + REACT + TAILWIND, HEADLESS CMS (PAYLOAD/SANITY), CLOUDFLARE PAGES, PRIVACY-FIRST ANALYTICS, N8N LEAD-CAPTURE PIPELINE, PERFORMANCE BUDGETS, GIT HANDOFF.',
          },
          delivery: {
            timeline: '3 weeks',
            pages: 'Up to 5',
            performance: 'Lighthouse 90+',
          },
          features: [
            'Up to 5 custom-designed pages',
            'Headless CMS integration',
            'Privacy-first analytics',
            'Lead capture → n8n automation',
            'Performance optimization (LH 90+)',
            'Cloudflare hosting (first year)',
            'Source code ownership',
            'Monthly maintenance + content support',
          ],
          crossSell: {
            label:
              'Pair with a Core Agent so the contact form is not your only after-hours capture',
            offeringId: 'basic',
          },
        },
      },
    ],
  },
  {
    id: 'gtm_ops',
    name: 'gtm_ops',
    description:
      'The proposal-generation runtime from the Wranngle stack. Lead in, branded proposal out, with demo fixtures when you just want to inspect the flow.',
    items: [
      {
        id: 'gtm-ops-trial',
        name: 'Trial',
        price: '0',
        priceCadence: 'monthly',
        description:
          '14-day evaluation of gtm_ops with Plus-tier features. Lead in, branded proposal out — 5 proposals, no card required.',
        cta: 'Start gtm_ops Trial',
        features: [
          '14-day evaluation of Plus-tier features',
          'Up to 5 proposals during trial',
          'Branded PDF generation',
          'Demo data preloaded',
          'Gemini-powered extraction',
          'No credit card required',
          'Upgrade or cancel anytime',
        ],
        facts: {
          kind: 'saas',
          tierName: 'Trial',
          discountPercent: 0,
          headlinePrice: 0,
          annualMonthly: 0,
          addon: {price: 0, label: 'free for 14 days'},
          pricing: {monthly: 0, annualMonthly: 0},
          specs: {
            coverage: '14-day evaluation window',
            ingredients:
              'GEMINI EXTRACTION ENGINE, BRANDED PDF RENDERER, DEMO DATA SEEDS, AUDIT LOG, EVENT REPLAY, CLOUDFLARE PAGES DELIVERY, NO CREDIT CARD GATE.',
          },
          saasLimits: {
            proposalsCap: '5 over 14 days',
            users: '1',
            sso: false,
            customDomain: false,
            auditChain: 'Standard',
          },
          features: [
            '14-day evaluation of Plus-tier features',
            '5 proposals during trial',
            'Branded PDF output',
            'Demo data preloaded',
            'Gemini-powered extraction',
            'Audit log',
            'No credit card required',
          ],
          crossSell: {
            label:
              'Outgrowing the trial? Plus unlocks 50 proposals/mo + custom branding',
            offeringId: 'gtm-ops-plus',
          },
        },
      },
      {
        id: 'gtm-ops-plus',
        name: 'Plus',
        price: '20',
        priceCadence: 'monthly',
        description:
          'For solo operators and small teams running real proposals. Branded PDFs, custom workspace, full audit chain.',
        badge: 'Most Popular',
        cta: 'Start gtm_ops Plus',
        monthlyAddon: {price: '200', label: '/yr (annual, 17% off)'},
        features: [
          '50 proposals per month',
          'Branded PDFs with your logo + colors',
          'Custom workspace branding',
          'Lead intake forms',
          'Full audit log',
          'n8n webhook integration',
          'Gemini-powered extraction',
          'Email support',
        ],
        facts: {
          kind: 'saas',
          tierName: 'Plus',
          discountPercent: 17,
          headlinePrice: 20,
          annualMonthly: 16.67,
          addon: {price: 200, label: '/yr (annual, 17% off)'},
          pricing: {monthly: 20, annualMonthly: 16.67},
          specs: {
            coverage: '50 proposals/mo per workspace',
            ingredients:
              'GEMINI EXTRACTION ENGINE, BRANDED PDF RENDERER, CUSTOM LOGO + COLOR INJECTION, LEAD INTAKE FORMS, N8N WEBHOOK BUS, FULL AUDIT LOG, CLOUDFLARE D1 PERSISTENCE.',
          },
          saasLimits: {
            proposalsCap: '50',
            users: '3',
            sso: false,
            customDomain: false,
            auditChain: 'Full',
          },
          features: [
            '50 proposals/mo',
            'Branded PDF output (logo + colors)',
            'Custom workspace branding',
            'Lead intake forms',
            'Full audit log',
            'n8n webhook integration',
            'Gemini-powered extraction',
            'Email support',
          ],
          crossSell: {
            label:
              'Need SSO, team workspaces, or unlimited proposals? Pro tier ships with all of it',
            offeringId: 'gtm-ops-pro',
          },
        },
      },
      {
        id: 'gtm-ops-pro',
        name: 'Pro',
        price: '99',
        priceCadence: 'monthly',
        description:
          'For teams who need SSO, custom domains, and unlimited throughput. Built for ops orgs that ship hundreds of proposals.',
        cta: 'Talk to Cody',
        monthlyAddon: {price: '990', label: '/yr annual plan'},
        features: [
          'Unlimited proposals',
          'Everything in Plus',
          'SSO (Google + Azure AD)',
          'Team workspaces with role-based access',
          'Custom domain (proposals.yourco.com)',
          'Advanced audit chain (immutable, exportable)',
          'Priority support',
          'Onboarding session included',
        ],
        facts: {
          kind: 'saas',
          tierName: 'Pro',
          discountPercent: 17,
          headlinePrice: 99,
          annualMonthly: 82.5,
          addon: {price: 990, label: '/yr (annual, 17% off)'},
          pricing: {monthly: 99, annualMonthly: 82.5},
          specs: {
            coverage: 'Unlimited proposals, multi-team',
            ingredients:
              'GOOGLE + AZURE AD SSO, TEAM WORKSPACES, ROLE-BASED ACCESS, CUSTOM DOMAIN ROUTING, IMMUTABLE AUDIT CHAIN, EXPORT-READY COMPLIANCE LOGS, PRIORITY SUPPORT.',
          },
          saasLimits: {
            proposalsCap: 'Unlimited',
            users: 'Unlimited',
            sso: true,
            customDomain: true,
            auditChain: 'Immutable + exportable',
          },
          features: [
            'Unlimited proposals',
            'Everything in Plus',
            'SSO (Google + Azure AD)',
            'Team workspaces + RBAC',
            'Custom domain',
            'Immutable audit chain',
            'Priority support',
            'Onboarding session',
          ],
          crossSell: {
            label:
              'Want a custom AI agent funnelling leads into gtm_ops? See the Elite Agent',
            offeringId: 'premium',
          },
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
