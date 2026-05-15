/**
 * Runtime vertical landing-page registry. Mirrors content/verticals.yaml
 * field-for-field; tests/e2e/vertical-pages.test.tsx asserts both files
 * stay in sync. Edit YAML first, then mirror here.
 *
 * Slugs ("plumbers", "hvac", "electricians") are the same identifiers
 * the per-vertical schema.org/Service JSON-LD round-1 work expects on
 * Service.serviceArea — do not rename without updating that path too.
 */
export type VerticalSlug = 'plumbers' | 'hvac' | 'electricians';

export type Vertical = {
  slug: VerticalSlug;
  displayName: string;
  headline: string;
  subhead: string;
  ctaLabel: string;
  ogImage: string;
  proofPoints: string[];
};

export const VERTICALS: readonly Vertical[] = [
  {
    slug: 'plumbers',
    displayName: 'Plumbers',
    headline:
      "AI voice agents that book plumbing jobs while you're under a sink.",
    subhead:
      'Capture every after-hours leak call, qualify the job, and route it to whoever is on call — no answering service, no missed revenue.',
    ctaLabel: 'Book a plumbing-agent walkthrough',
    ogImage: 'https://wranngle.com/og/verticals/plumbers.png',
    proofPoints: [
      '24/7 coverage for emergency leak and clog calls',
      'Qualifies job type, urgency, and address before the handoff',
      'Routes urgent jobs to the on-call tech via SMS or call',
    ],
  },
  {
    slug: 'hvac',
    displayName: 'HVAC',
    headline:
      'AI voice agents built for heating, cooling, and seasonal call spikes.',
    subhead:
      'Handle the 6am no-heat surge and the 95-degree AC rush without staffing a call center — every caller gets a real conversation, every lead lands in your CRM.',
    ctaLabel: 'Book an HVAC-agent walkthrough',
    ogImage: 'https://wranngle.com/og/verticals/hvac.png',
    proofPoints: [
      'Seasonal-surge ready for heat waves and cold snaps',
      'Books maintenance visits and quotes replacements with a script you control',
      'Logs every call with transcript, intent, and follow-up status',
    ],
  },
  {
    slug: 'electricians',
    displayName: 'Electricians',
    headline: 'AI voice agents that triage panel calls and book licensed work.',
    subhead:
      'Separate the "outlet is dead" jobs from the "smoke smell at the panel" emergencies — your agent qualifies the call and routes it to the right tech every time.',
    ctaLabel: 'Book an electrician-agent walkthrough',
    ogImage: 'https://wranngle.com/og/verticals/electricians.png',
    proofPoints: [
      'Triages outage, panel, and permit-required jobs at intake',
      'Captures permit and inspection requirements up front',
      'Routes high-risk calls (smoke, sparks) to the on-call tech immediately',
    ],
  },
] as const;

export const VERTICAL_SLUGS: readonly VerticalSlug[] = VERTICALS.map(
  (v) => v.slug,
);

export function getVertical(slug: string): Vertical | undefined {
  return VERTICALS.find((v) => v.slug === slug);
}
