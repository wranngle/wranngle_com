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
    name: 'Starter',
    price: '$299',
    period: '/month',
    features: [
      '1 AI voice agent',
      '500 voice minutes / mo',
      'SMS + web chat fallback',
      'Calendar + CRM handoff',
      'Email support',
    ],
    ctaLabel: 'Start with Starter',
    ctaHref: '/#offerings',
  },
  {
    slug: 'professional',
    name: 'Professional',
    price: '$899',
    period: '/month',
    features: [
      'Up to 3 AI voice agents',
      '2,500 voice minutes / mo',
      'Per-location routing',
      'Custom intent + objection coverage',
      'Priority support + monthly review',
    ],
    ctaLabel: 'Choose Professional',
    ctaHref: '/#offerings',
    highlight: true,
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited agents + locations',
      'Custom voice minutes pool',
      'SSO + audit log access',
      'Dedicated solutions engineer',
      'SLAs + uptime guarantees',
    ],
    ctaLabel: 'Talk to sales',
    ctaHref: '/#offerings',
  },
];
