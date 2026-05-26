import React, {useEffect, useMemo, useState} from 'react';
import {Link} from 'wouter';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';
import PilotAgreement, {
  PILOT_AGREEMENT_VERSION,
} from '@/components/PilotAgreement.tsx';

/**
 * Pilot agreement signing page. Renders the inlined agreement body and the
 * click-through PilotAgreement component which fires a pilot.intent event
 * at /api/ticker on accept.
 *
 * Self-selection inputs (vertical, region) are kept above the agreement so
 * the eventual telemetry row carries useful bucketed signal without ever
 * collecting PII.
 */

const VERTICALS = [
  {value: 'unspecified', label: 'Pick one…'},
  {value: 'hvac', label: 'HVAC'},
  {value: 'plumbing', label: 'Plumbing'},
  {value: 'electrical', label: 'Electrical'},
  {value: 'auto-repair', label: 'Auto repair'},
  {value: 'dental', label: 'Dental / orthodontics'},
  {value: 'legal', label: 'Legal / law firm'},
  {value: 'home-services', label: 'Other home services'},
  {value: 'other', label: 'Other'},
] as const;

const REGIONS = [
  {value: 'unspecified', label: 'Pick one…'},
  {value: 'us-west', label: 'US — West'},
  {value: 'us-southwest', label: 'US — Southwest'},
  {value: 'us-midwest', label: 'US — Midwest'},
  {value: 'us-south', label: 'US — South'},
  {value: 'us-northeast', label: 'US — Northeast'},
  {value: 'ca', label: 'Canada'},
  {value: 'other', label: 'Other'},
] as const;

const AGREEMENT_BODY: Array<{
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  emphasis?: string;
}> = [
  {
    paragraphs: [
      'This pilot agreement governs the 30-day Wranngle Systems pilot ("Pilot") between the operator named in the intake form ("Pilot Customer") and Wranngle LLC, d/b/a Wranngle Systems ("Wranngle"). Clicking I agree binds the Pilot Customer to the terms below.',
    ],
  },
  {
    heading: '1. Pilot Scope',
    paragraphs: [
      'Wranngle will provision one (1) AI voice agent against a single business phone number, plus the gtm_ops intake/enrichment pipeline against that agent. The Pilot runs for thirty (30) calendar days from the day the agent is live on the Pilot Customer’s published number.',
    ],
    bullets: [
      '24/7 AI voice agent answering inbound calls',
      'Lead qualification with structured-extraction transcripts',
      'One n8n workflow connecting the agent to the Pilot Customer’s CRM or spreadsheet of record',
      'Daily run log with call transcripts, latency, and handoff outcomes',
      'Two (2) prompt-revision cycles, each scoped to ≤30 minutes',
    ],
  },
  {
    heading: '2. Pricing and Conversion',
    paragraphs: [
      'The Pilot is offered at a flat $1,000 USD for the 30-day window. There is no commitment beyond the Pilot. At day 30 the Pilot Customer may convert to a Core Agent plan at $250/month, convert to an Elite plan at the rate quoted in writing during the Pilot, or walk away with no further obligation. If the Pilot Customer chooses to convert, the first month of the production plan is credited the unused portion of the Pilot fee prorated to the remaining days in the calendar month.',
    ],
  },
  {
    heading: '3. Acceptance Criteria',
    paragraphs: [
      'The Pilot is considered successful when, at day 30, the agent has:',
    ],
    bullets: [
      'Answered ≥95% of inbound calls within four (4) rings (production data)',
      'Maintained P95 voice-path latency ≤500 ms across the Pilot window',
      'Produced structured intake records for ≥80% of qualifying calls',
      'Recorded zero (0) silent failures (dropped calls without a transcript)',
    ],
    emphasis:
      'Failure to meet these thresholds at day 30 entitles the Pilot Customer to a full refund of the Pilot fee.',
  },
  {
    heading: '4. Data Handling',
    paragraphs: [
      'All call recordings and transcripts are encrypted in transit and at rest. Retention defaults to 90 days; the Pilot Customer may request immediate deletion of any specific recording. Aggregated, de-identified metrics (latency, call-volume buckets, vertical) may be retained indefinitely for product analytics. The Pilot Customer is responsible for posting a recording disclosure that satisfies the call recording law of every U.S. state in which their inbound callers may originate.',
    ],
  },
  {
    heading: '5. Telemetry',
    paragraphs: [
      'When the Pilot Customer clicks I agree, the front end fires one anonymized telemetry event with no name, no email, no phone, no IP, and no company identifier. It contains only: event, ISO timestamp, self-selected vertical bucket, the literal value_bucket "pilot", self-selected broad region, and the agreement version. The event is consumed by the gtm_ops /api/ticker endpoint to populate the live booking ticker on wranngle.com. Pilot Customers who do not want this event recorded should contact pilot@wranngle.com to execute the agreement via a counter-signed PDF instead.',
    ],
  },
  {
    heading: '6. Termination',
    paragraphs: [
      'Either party may terminate the Pilot at any time during the 30-day window. On Pilot Customer termination, Wranngle will deactivate the agent within one (1) business day, deliver a full export of call transcripts, recordings, and structured intake records via secure download within seven (7) business days, and refund a prorated portion of the Pilot fee for any unused full days.',
    ],
  },
  {
    heading: '7. Limitation of Liability',
    paragraphs: [
      'In no event shall Wranngle’s aggregate liability arising out of or related to the Pilot exceed the total fees paid by the Pilot Customer under this agreement (i.e., $1,000 USD). This cap applies to all claims under any theory of liability.',
    ],
  },
  {
    heading: '8. Counter-Signed Variant Available',
    paragraphs: [
      'A counter-signed PDF version of this agreement is available at pilot@wranngle.com. Pilot Customers in regulated industries (medical, legal, financial services) are encouraged to use the counter-signed variant; terms are identical.',
    ],
  },
];

function AgreementBody() {
  return (
    <div className="space-y-6">
      {AGREEMENT_BODY.map((section, index) => (
        <section key={section.heading ?? `intro-${index}`}>
          {/* h2 (not h3): the page's <h1> is "Pilot Agreement"; each
              numbered clause is a top-level section of the agreement, so
              the semantic level must be h2 to match the source markdown
              and avoid a heading-level skip (an a11y violation found by
              the route-level a11y audit). text-xl preserves the visual
              size — semantic level is independent of font-size. */}
          {section.heading ? (
            <h2 className="brand-font text-xl font-semibold mb-2">
              {section.heading}
            </h2>
          ) : null}
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="opacity-80 mb-3 leading-relaxed">
              {paragraph}
            </p>
          ))}
          {section.bullets ? (
            <ul className="list-disc list-inside opacity-80 space-y-1 ml-2 mb-2">
              {section.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
          {section.emphasis ? (
            <p className="opacity-90 italic">{section.emphasis}</p>
          ) : null}
        </section>
      ))}
    </div>
  );
}

export default function Pilot() {
  const {isDark, toggle: toggleTheme} = useDarkMode();
  const [vertical, setVertical] = useState<string>('unspecified');
  const [region, setRegion] = useState<string>('unspecified');

  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = 'Pilot Agreement — Wranngle Systems';
  }, []);

  const agreementBody = useMemo(() => <AgreementBody />, []);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 ${
        isDark
          ? 'dark bg-[#12111a] text-[#fcfaf5]'
          : 'bg-[#fcfaf5] text-[#12111a]'
      }`}
    >
      <div
        className={`min-h-screen flex flex-col ${
          isDark ? 'bg-page-dark' : 'bg-page-light'
        }`}
      >
        <SiteHeader isDark={isDark} toggleTheme={toggleTheme} />
        <main id="main" className="flex-1 py-16 px-6">
          <style>{`.brand-font { font-family: 'Bricolage Grotesque', sans-serif; }`}</style>
          <div className="max-w-4xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[var(--s500)] hover:underline mb-8"
            >
              ← Back to Home
            </Link>

            <h1 className="brand-font text-5xl font-bold mb-4">
              Pilot Agreement
            </h1>
            <p
              data-testid="pilot-agreement-version"
              className="text-sm opacity-60 mb-2"
            >
              Version {PILOT_AGREEMENT_VERSION} · 30-day pilot · $1,000 flat
            </p>
            <p className="opacity-80 mb-10 max-w-2xl">
              Click-through pilot terms for the Wranngle Systems voice agent +
              gtm_ops bundle. Pick a vertical and region (so we know which
              bucket to slot the pilot under), read the terms, and click{' '}
              <strong>I agree</strong>.
            </p>

            <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium opacity-80">Vertical</span>
                <select
                  data-testid="pilot-vertical-select"
                  value={vertical}
                  onChange={(e) => {
                    setVertical(e.target.value);
                  }}
                  className="rounded-lg border border-[var(--s500)]/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--s500)]/40"
                >
                  {VERTICALS.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium opacity-80">Region</span>
                <select
                  data-testid="pilot-region-select"
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                  }}
                  className="rounded-lg border border-[var(--s500)]/30 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--s500)]/40"
                >
                  {REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <PilotAgreement
              body={agreementBody}
              vertical={vertical}
              region={region}
            />

            <p className="mt-12 text-sm opacity-60">
              Need the counter-signed PDF variant?{' '}
              <a
                className="underline"
                href="mailto:pilot@wranngle.com?subject=Pilot%20agreement%20%E2%80%94%20counter-signed%20PDF"
              >
                pilot@wranngle.com
              </a>
            </p>
          </div>
        </main>
        <SiteFooter isDark={isDark} />
      </div>
    </div>
  );
}
