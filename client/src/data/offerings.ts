export type PricingTier = {
  monthly: number;
  annualMonthly: number;
  addon?: number;
};

export type OfferingFacts = {
  tierName: string;
  discountPercent: number;
  pricing: PricingTier;
  specs: {coverage: string; ingredients: string};
  limits: {minutes: string; sms: string};
  features: string[];
};

export type OfferingItem = {
  id: string;
  name: string;
  price: string;
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
      'Autonomous voice, web, and SMS agents that capture leads 24/7.',
    items: [
      {
        id: 'basic',
        name: 'Core Agent',
        price: '250',
        description:
          'Voice-only AI agent with after-hours coverage and lead scoring.',
        cta: 'Deploy Core Agent',
        features: [
          'Voice-only AI Agent',
          'After-hours coverage',
          'SMS Follow-up',
          'Email lead capture',
          'Basic Support',
        ],
        facts: {
          tierName: 'Core',
          discountPercent: 15,
          pricing: {monthly: 250, annualMonthly: 212.5, addon: 250},
          specs: {
            coverage: 'After Hours',
            ingredients:
              'NATURAL LANGUAGE PROCESSING, LEAD SCORING ALGORITHM, TWILIO VOICE STACK, SHARED SMS POOL, ONE-WAY NOTIFICATIONS, 100% AUTOMATION.',
          },
          limits: {minutes: '1,000', sms: '500'},
          features: [
            'Voice-only AI Agent',
            'Service Call Detection',
            'Lead Scoring & Qualification',
            'One-Way Shared SMS Notify',
            'Call Forwarding to Mobile',
            'Standard Trade Training Data',
            'Basic Support',
          ],
        },
      },
      {
        id: 'premium',
        name: 'Elite Agent',
        price: '500',
        description:
          'Triple-channel agent with 24/7 priority coverage and calendar integration.',
        badge: 'Most Popular',
        cta: 'Deploy Elite Agent',
        features: [
          'Triple-channel Voice + Web + SMS AI Agents',
          '24/7 Priority coverage',
          'Calendar Integration',
          'Direct Transfer capability',
          'Custom Voice Identity',
          'Priority Support',
        ],
        facts: {
          tierName: 'Elite',
          discountPercent: 20,
          pricing: {monthly: 500, annualMonthly: 400, addon: 250},
          specs: {
            coverage: '24/7/365',
            ingredients:
              'PREMIUM NEURAL AUDIO (ELEVENLABS), DUAL-AGENT ON-CALL LOGIC, CAL.COM SYNC, 10DLC COMPLIANT SMS, UNIFIED INBOX ENGINE.',
          },
          limits: {minutes: '2,500', sms: '1,500'},
          features: [
            'Triple-channel Voice + Web + SMS AI Agents',
            'Dual-Agent On-Call System',
            'Lead Qualification',
            'Two-Way SMS (Unique Number)',
            'Cal.com Integration',
            'Unified AI Inbox',
            'Priority Support',
          ],
        },
      },
    ],
  },
  {
    id: 'websites',
    name: 'Websites',
    description:
      'High-performance websites built to convert visitors into customers.',
    items: [
      {
        id: 'landing-page',
        name: 'Landing Page',
        price: '900',
        description:
          'Custom landing page with responsive design, SEO, and ongoing maintenance.',
        cta: 'Get Started',
        monthlyAddon: {price: '100', label: 'maintenance'},
        features: [
          'Custom responsive design',
          'Mobile-first build',
          'SEO fundamentals',
          'Contact form integration',
          'Cloudflare hosting',
          'Monthly maintenance & security updates',
        ],
      },
      {
        id: 'business-site',
        name: 'Business Site',
        price: '3,500',
        description:
          'Multi-page website with CMS, analytics, and lead capture workflows.',
        badge: 'Best Value',
        cta: 'Get Started',
        features: [
          'Up to 5 pages',
          'CMS integration',
          'Analytics dashboard',
          'Lead capture + n8n automation',
          'Performance optimization',
          'Cloudflare hosting (1 year)',
        ],
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
