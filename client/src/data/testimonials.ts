/**
 * ILLUSTRATIVE / SAMPLE DATA — composite scenarios based on typical results,
 * NOT quotes from real named customers. The grid renders an "Illustrative
 * examples" disclaimer. Do not present these as genuine endorsements; swap in
 * real, consenting-customer quotes before treating any of this as a claim.
 *
 * Runtime testimonial registry. Mirrors content/testimonials.yaml
 * field-for-field; tests/e2e/testimonials.test.tsx asserts both files
 * stay in sync. Edit YAML first, then mirror here.
 *
 * The grid filters by `state` (2-letter USPS code) and `zip` (5-digit
 * code; prefix-match supported so "907" narrows to LA-area testimonials).
 * Keep both axes populated — the filter promise from round-2 §6 item-4
 * is "search by state/ZIP, only matching cards render".
 */
export type TestimonialVertical =
  | 'plumbers'
  | 'hvac'
  | 'electricians'
  | 'other';

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  businessName: string;
  /** Uppercase 2-letter USPS state code. */
  state: string;
  /** 5-digit ZIP code, stored as string so leading zeros survive. */
  zip: string;
  vertical: TestimonialVertical;
  quote: string;
};

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: 'abc-hvac-fresno',
    name: 'Marisol R.',
    role: 'Owner',
    businessName: 'ABC HVAC',
    state: 'CA',
    zip: '93720',
    vertical: 'hvac',
    quote:
      'Our agent picked up 41 missed calls in the first two weeks. We booked 12 jobs we would have lost to voicemail before lunch.',
  },
  {
    id: 'bayside-plumbing-sd',
    name: 'Devon P.',
    role: 'Operations Manager',
    businessName: 'Bayside Plumbing',
    state: 'CA',
    zip: '92101',
    vertical: 'plumbers',
    quote:
      'The agent handles the 6am leak calls so my dispatcher can actually dispatch. Revenue from after-hours intake is up roughly thirty percent.',
  },
  {
    id: 'lone-star-electric',
    name: 'Hank V.',
    role: 'Master Electrician',
    businessName: 'Lone Star Electric',
    state: 'TX',
    zip: '78701',
    vertical: 'electricians',
    quote:
      'Smoke-at-the-panel calls now route to me in under a minute. The wrong-fit jobs are still captured, just on the right priority lane.',
  },
  {
    id: 'rockies-hvac',
    name: 'Jenna K.',
    role: 'Owner-Operator',
    businessName: 'Rockies HVAC',
    state: 'CO',
    zip: '80202',
    vertical: 'hvac',
    quote:
      'We staffed one technician less than last winter and still answered every call. The booking script is exactly the language I would have used myself.',
  },
  {
    id: 'greenline-plumbing-la',
    name: 'Aaron S.',
    role: 'General Manager',
    businessName: 'Greenline Plumbing',
    state: 'CA',
    zip: '90001',
    vertical: 'plumbers',
    quote:
      'Three months in and the agent has captured a permit-required job every single week. We used to lose those to whoever picked up first.',
  },
] as const;

/**
 * Apply the state/ZIP filter the grid exposes. Both inputs are optional;
 * an empty filter returns every testimonial untouched. State match is
 * case-insensitive on a 2-letter code; ZIP match is a left-prefix so a
 * partial ZIP like "907" still narrows.
 */
export function filterTestimonials(
  testimonials: readonly Testimonial[],
  filter: {state?: string; zip?: string},
): Testimonial[] {
  const stateNeedle = filter.state?.trim().toUpperCase() ?? '';
  const zipNeedle = filter.zip?.trim() ?? '';
  return testimonials.filter((entry) => {
    if (stateNeedle && entry.state.toUpperCase() !== stateNeedle) return false;
    if (zipNeedle && !entry.zip.startsWith(zipNeedle)) return false;
    return true;
  });
}

export const TESTIMONIAL_STATES: readonly string[] = [
  ...new Set(TESTIMONIALS.map((t) => t.state)),
].sort();
