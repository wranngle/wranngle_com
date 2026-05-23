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
      'Voice, web chat, and SMS agents for teams that need reliable lead capture. They answer, qualify, route, and log leads without a long contract.',
    items: [
      {
        id: 'basic',
        name: 'Core Agent',
        price: '250',
        priceCadence: 'monthly',
        description:
          'Voice receptionist for overflow and after-hours calls. It captures caller details and sends the transcript to your team.',
        cta: 'Get Core Agent',
        features: [
          '24/7 voice answering on a forwarded line',
          'Company-specific training on your services, pricing, and policies',
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
              'Forwarded business line, call transcript, lead scoring, workflow-specific prompts, SMS alerts, email notifications.',
          },
          limits: {minutes: '1,000', sms: '500'},
          features: [
            'Voice agent (single channel)',
            'Customer-request detection',
            'Lead scoring & qualification',
            'One-way SMS notify (shared pool)',
            'Forwarding to your mobile on hot leads',
            'Company-specific training data',
            'Standard support',
          ],
          crossSell: {
            label:
              'Pair with a landing page so form leads and phone leads land in one follow-up path',
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
          'Voice, web chat, and two-way SMS with booking and human handoff. Built for teams that need coverage across more than one channel.',
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
              'ElevenLabs voice, on-call routing rules, Cal.com booking, compliant two-way SMS, shared inbox, priority support.',
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
              'Add a business site when the agent, forms, and service pages need to work together',
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
      'Owned websites with lead forms, SEO basics, hosting, and optional maintenance. You get the source code.',
    items: [
      {
        id: 'landing-page',
        name: 'Landing Page',
        price: '900',
        priceCadence: 'one-time',
        description:
          'One focused page shipped in 7 days. Mobile-first, SEO basics, and a contact form wired to email and n8n.',
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
            coverage: 'One-page lead capture site',
            ingredients:
              'Vite build, responsive layout, Cloudflare Pages hosting, validated contact form, n8n lead webhook, Core Web Vitals budget, Git handoff.',
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
              'Add web chat when visitors need answers before they fill out the form',
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
          'Up to 5 pages with CMS editing, analytics, and lead routing. Shipped in 3 weeks with source code included.',
        badge: 'Best Value',
        cta: 'Start Business Site',
        monthlyAddon: {price: '250', label: 'maintenance'},
        features: [
          'Up to 5 pages with custom design',
          'Headless CMS (you edit copy without us)',
          'Analytics dashboard',
          'Lead capture form → email + webhook',
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
              'React + Tailwind build, headless CMS, Cloudflare Pages hosting, analytics, n8n lead routing, performance budget, Git handoff.',
          },
          delivery: {
            timeline: '3 weeks',
            pages: 'Up to 5',
            performance: 'Lighthouse 90+',
          },
          features: [
            'Up to 5 custom-designed pages',
            'Headless CMS integration',
            'Analytics dashboard',
            'Lead capture → email + webhook',
            'Performance optimization (LH 90+)',
            'Cloudflare hosting (first year)',
            'Source code ownership',
            'Monthly maintenance + content support',
          ],
          crossSell: {
            label:
              'Pair with a Core Agent when calls matter as much as form submissions',
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
      'A proposal console for turning lead details into branded PDFs with enrichment, templates, and a run log.',
    items: [
      {
        id: 'gtm-ops-trial',
        name: 'Trial',
        price: '0',
        priceCadence: 'monthly',
        description:
          '14-day trial with Plus features, 5 proposal runs, demo data, and no credit card required.',
        cta: 'Start gtm_ops Trial',
        features: [
          '14-day evaluation of Plus-tier features',
          'Up to 5 proposals during trial',
          'Branded PDF generation',
          'Demo data preloaded',
          'Gemini field extraction',
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
              'Gemini extraction, branded PDF renderer, demo data, run log, event replay, Cloudflare Pages delivery, no credit card.',
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
            'Gemini field extraction',
            'Audit log',
            'No credit card required',
          ],
          crossSell: {
            label:
              'Use Plus when you need 50 proposal runs per month and custom branding',
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
          'For solo operators and small teams sending real proposals. Includes branded PDFs, workspace branding, forms, webhooks, and a full run log.',
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
          'Gemini field extraction',
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
              'Gemini extraction, branded PDF renderer, custom logo and colors, lead intake forms, n8n webhooks, full run log, Cloudflare D1 storage.',
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
            'Gemini field extraction',
            'Email support',
          ],
          crossSell: {
            label:
              'Use Pro when you need SSO, team workspaces, custom domain, or unlimited proposal runs',
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
          'For teams that need SSO, role-based access, a custom domain, and unlimited proposal runs.',
        cta: 'Talk to Sales',
        monthlyAddon: {price: '990', label: '/yr annual plan'},
        features: [
          'Unlimited proposals',
          'Everything in Plus',
          'SSO (Google + Azure AD)',
          'Team workspaces with role-based access',
          'Custom domain (proposals.yourco.com)',
          'Exportable run log',
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
              'Google and Azure AD SSO, team workspaces, role-based access, custom domain routing, exportable logs, priority support.',
          },
          saasLimits: {
            proposalsCap: 'Unlimited',
            users: 'Unlimited',
            sso: true,
            customDomain: true,
            auditChain: 'Exportable',
          },
          features: [
            'Unlimited proposals',
            'Everything in Plus',
            'SSO (Google + Azure AD)',
            'Team workspaces + RBAC',
            'Custom domain',
            'Exportable run log',
            'Priority support',
            'Onboarding session',
          ],
          crossSell: {
            label:
              'Add an Elite Agent when phone and chat leads should feed gtm_ops directly',
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
