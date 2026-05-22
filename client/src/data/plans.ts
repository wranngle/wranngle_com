export type PlanCard = {
  slug: 'starter' | 'professional' | 'enterprise';
  name: string;
  price: string;
  period: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlight?: boolean;
};

export const plans: PlanCard[] = [
  {
    slug: 'starter',
    name: 'Core Agent',
    price: '$250',
    period: '/month',
    features: [
      '24/7 voice answering on a forwarded line',
      '1,000 voice minutes / mo',
      '500 SMS notification segments / mo',
      'Lead scoring + transcript handoff',
      'Standard support',
    ],
    ctaLabel: 'Get Core Agent',
    ctaHref: '/#offerings-basic',
  },
  {
    slug: 'professional',
    name: 'Elite Agent',
    price: '$500',
    period: '/month',
    features: [
      'Voice + web chat + two-way SMS',
      '2,500 voice minutes / mo',
      '1,500 SMS segments / mo',
      'Cal.com booking + human handoff',
      'Priority support, 4-hour response',
    ],
    ctaLabel: 'Get Elite Agent',
    ctaHref: '/#offerings-premium',
    highlight: true,
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Multi-location agent programs',
      'Custom voice minutes pool',
      'Custom routing, CRM, and reporting',
      'Dedicated implementation support',
      'Written uptime and support terms',
    ],
    ctaLabel: 'Talk to sales',
    ctaHref: '/#offerings-ai-agents',
  },
];
