import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Calculator} from 'lucide-react';
import {computeRoi, formatCurrency, type RoiResult} from '@/lib/roi.ts';
import RoiBusinessWordmark, {
  type RoiBusinessId,
} from '@/components/RoiBusinessWordmark.tsx';

/**
 * Interactive ROI calculator surfaced on the homepage. Three inputs
 * (company, inbound calls/month, average ticket) drive a deterministic
 * formula in `@/lib/roi.ts`. Each settled interaction emits a single
 * `/api/ticker` POST shaped `{ event: "roi.calculated", company, calls,
 * ticket, savings_monthly }` so the same back-end that powers the live
 * booking ticker (round 1 PR #74) also records calculator engagement.
 *
 * Telemetry never blocks render; failures are swallowed by design.
 */

type RoiCalculatorProps = {
  isDark: boolean;
  /** Override the telemetry endpoint (tests pass `undefined` to keep the
   *  default; integration overrides it for staging). */
  tickerEndpoint?: string;
  /** Seed values for SSR / deterministic snapshot tests. */
  initialCompany?: string;
  initialCalls?: number;
  initialTicket?: number;
  /** Auto-rotate through ROI_SCENARIOS until the visitor takes over.
   *  Tests pass false to pin the seeded inputs for deterministic assertions. */
  autoRotate?: boolean;
};

const DEFAULT_TICKER_ENDPOINT = '/api/ticker';
const TELEMETRY_DEBOUNCE_MS = 600;
const SCENARIO_DWELL_MS = 5000;
const TYPE_TICK_MS = 55;

/**
 * Mock business scenarios the calculator rotates through until the user
 * takes over. Each drives the company name (typewriter), the calls/ticket
 * inputs, the computed savings, and the blurb below — so a drive-by reader
 * sees several concrete examples without touching anything.
 *
 * `wordmarkId` keys into RoiBusinessWordmark, which renders a real custom
 * inline-SVG logo lockup for that business (icon glyph + wordmark + gradients
 * / strokes / layered accents). Visitor-typed company names fall back to the
 * default brand-gradient text — no SVG.
 */
const ROI_SCENARIOS: Array<{
  company: string;
  calls: number;
  ticket: number;
  blurb: string;
  wordmarkId: RoiBusinessId;
}> = [
  {
    company: 'Bella Vista Trattoria',
    calls: 90,
    ticket: 120,
    blurb:
      'Reservations, private events, and patio overflow — every missed call is a table that books somewhere else.',
    wordmarkId: 'trattoria',
  },
  {
    company: 'Tidewater Family Dental',
    calls: 140,
    ticket: 320,
    blurb:
      'New-patient calls and same-day emergencies convert at a premium when someone actually answers after hours.',
    wordmarkId: 'dental',
  },
  {
    company: 'Atlas Hair Co.',
    calls: 110,
    ticket: 95,
    blurb:
      'Color and cut bookings reschedule constantly; a 24/7 agent keeps the chair full instead of the voicemail.',
    wordmarkId: 'salon',
  },
  {
    company: 'Northside Fitness Co.',
    calls: 70,
    ticket: 180,
    blurb:
      'On-ramp and drop-in inquiries spike at odd hours — capture the trial before the lead cools off.',
    wordmarkId: 'fitness',
  },
  {
    company: 'Cedar & Co Plumbing',
    calls: 120,
    ticket: 480,
    blurb:
      'A burst pipe at 2 AM is an emergency job; voicemail just sends it to the next contractor on the list.',
    wordmarkId: 'plumbing',
  },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (globalThis.window === undefined) return;
    const mq = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };

    mq.addEventListener('change', onChange);
    return () => {
      mq.removeEventListener('change', onChange);
    };
  }, []);
  return reduced;
}

export default function RoiCalculator({
  isDark,
  tickerEndpoint = DEFAULT_TICKER_ENDPOINT,
  initialCompany = ROI_SCENARIOS[0].company,
  initialCalls = ROI_SCENARIOS[0].calls,
  initialTicket = ROI_SCENARIOS[0].ticket,
  autoRotate = true,
}: RoiCalculatorProps) {
  const [company, setCompany] = useState(initialCompany);
  const [calls, setCalls] = useState(initialCalls);
  const [ticket, setTicket] = useState(initialTicket);
  // Once the visitor focuses or edits a field, the rotation stops for good
  // and the values are theirs to drive.
  const [paused, setPaused] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [typedLen, setTypedLen] = useState(initialCompany.length);
  const reducedMotion = usePrefersReducedMotion();

  const takeOver = useCallback(() => {
    setPaused(true);
  }, []);

  // Scenario rotation: advance the active scenario on a dwell timer until
  // the visitor takes over. Reduced-motion users get a static first card.
  useEffect(() => {
    if (paused || reducedMotion || !autoRotate) return;
    const id = globalThis.setInterval(() => {
      setScenarioIndex((index) => (index + 1) % ROI_SCENARIOS.length);
    }, SCENARIO_DWELL_MS);
    return () => {
      globalThis.clearInterval(id);
    };
  }, [paused, reducedMotion, autoRotate]);

  // Apply the active scenario's calls/ticket immediately and type the
  // company name out character by character for the heading effect.
  useEffect(() => {
    if (paused || !autoRotate) return;
    const scenario = ROI_SCENARIOS[scenarioIndex];
    setCalls(scenario.calls);
    setTicket(scenario.ticket);
    if (reducedMotion) {
      setCompany(scenario.company);
      setTypedLen(scenario.company.length);
      return;
    }

    setTypedLen(0);
    const id = globalThis.setInterval(() => {
      setTypedLen((length) => {
        const next = length + 1;
        setCompany(scenario.company.slice(0, next));
        if (next >= scenario.company.length) globalThis.clearInterval(id);
        return next;
      });
    }, TYPE_TICK_MS);
    return () => {
      globalThis.clearInterval(id);
    };
  }, [scenarioIndex, paused, reducedMotion]);

  const activeBlurb =
    paused || !autoRotate ? undefined : ROI_SCENARIOS[scenarioIndex].blurb;
  // Custom inline-SVG logo lockup while rotating; once the visitor types their
  // own company the heading falls back to the default brand-gradient text.
  const activeScenario =
    paused || !autoRotate ? undefined : ROI_SCENARIOS[scenarioIndex];
  const isTyping =
    autoRotate && !paused && !reducedMotion && typedLen < company.length;
  const wordmarkProgress = activeScenario
    ? Math.min(1, typedLen / activeScenario.company.length)
    : 0;

  const result: RoiResult = useMemo(
    () => computeRoi({company, calls, ticket}),
    [company, calls, ticket],
  );

  const tickerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (globalThis.fetch === undefined) return;
    // Don't emit telemetry while autoplay is driving the values — those are
    // synthetic scenario changes, not user calculations. Fire only once the
    // visitor takes over (paused) or when rotation is off entirely.
    if (autoRotate && !paused) return;
    if (tickerRef.current) clearTimeout(tickerRef.current);
    tickerRef.current = setTimeout(() => {
      const payload = {
        event: 'roi.calculated',
        company: result.company,
        calls: result.calls,
        ticket: result.ticket,
        savings_monthly: result.savingsMonthly,
      };
      try {
        void fetch(tickerEndpoint, {
          method: 'POST',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {
          // Telemetry never blocks render; failures are swallowed.
        });
      } catch {
        // fetch threw synchronously (e.g., in non-browser SSR) — ignore.
      }
    }, TELEMETRY_DEBOUNCE_MS);
    return () => {
      if (tickerRef.current) clearTimeout(tickerRef.current);
    };
  }, [
    tickerEndpoint,
    autoRotate,
    paused,
    result.company,
    result.calls,
    result.ticket,
    result.savingsMonthly,
  ]);

  const cardBg = isDark
    ? 'bg-[#18181b] text-[#fcfaf5] border-white/10'
    : 'bg-white text-[#12111a] border-black/5';

  const inputBg = isDark
    ? 'bg-white/5 border-white/10 text-[#fcfaf5] placeholder:text-white/40'
    : 'bg-black/[0.02] border-black/10 text-[#12111a] placeholder:text-black/40';

  return (
    <section
      id="roi"
      aria-labelledby="roi-heading"
      data-testid="roi-calculator"
      className="pt-10 pb-24 px-6 max-w-7xl mx-auto w-full"
    >
      <div className="mb-12 max-w-3xl">
        <div className="mono-font text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-3 flex items-center gap-2">
          <Calculator size={12} aria-hidden />
          <span>ROI // ESTIMATE</span>
        </div>
        <h2
          id="roi-heading"
          className="brand-font text-5xl md:text-6xl font-bold mb-6 leading-tight"
        >
          What does this look like for{' '}
          {activeScenario ? (
            // Real custom inline-SVG logo lockup per business. The SVG
            // carries its own letterforms, color, gradients, and icon
            // glyph; typing progress drives its accent reveal. Visitor-
            // typed names fall back to the brand-gradient text below.
            <span
              data-testid="roi-wordmark"
              data-wordmark-id={activeScenario.wordmarkId}
            >
              <RoiBusinessWordmark
                id={activeScenario.wordmarkId}
                progress={wordmarkProgress}
                label={activeScenario.company}
              />
            </span>
          ) : (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--s500)] to-[var(--v500)]">
              {result.company || 'your business'}
            </span>
          )}
          {isTyping && (
            <span
              aria-hidden
              className="inline-block w-[3px] -mb-1 h-[0.9em] bg-[var(--s500)] animate-pulse align-baseline"
            />
          )}
          ?
        </h2>
        <p
          className="opacity-70 text-base leading-relaxed min-h-[3rem] transition-opacity"
          data-testid="roi-scenario-blurb"
          // Only announce once the visitor drives the calculator. While
          // autoplay rotates marketing copy every 5s, keep the live region
          // silent so assistive tech isn't narrated at continuously.
          aria-live={autoRotate && !paused ? 'off' : 'polite'}
        >
          {activeBlurb ?? (
            <>
              Plug in your own call volume and average ticket. We assume 35% of
              inbound calls are missed, an AI agent answers 95% of those, and
              40% of recovered after-hours calls convert. Conservative on
              purpose.
            </>
          )}
        </p>
      </div>

      <div
        className={`grid md:grid-cols-2 gap-8 rounded-[20px_4px_20px_4px] border-y border-r border-l-4 border-l-[var(--s500)] noise-overlay ${cardBg} p-8`}
        style={{boxShadow: 'var(--shadow-card)'}}
      >
        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-70">
              Company name
            </span>
            <input
              type="text"
              value={company}
              data-testid="roi-input-company"
              onFocus={takeOver}
              onChange={(event) => {
                takeOver();
                setCompany(event.target.value);
              }}
              className={`px-4 py-3 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-[var(--s500)]`}
              placeholder="River North Bistro"
              maxLength={80}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-70">
              Inbound calls per month
            </span>
            <input
              type="number"
              min={0}
              max={10_000}
              value={calls}
              data-testid="roi-input-calls"
              onFocus={takeOver}
              onChange={(event) => {
                takeOver();
                const next = Number.parseInt(event.target.value, 10);
                setCalls(Number.isFinite(next) ? next : 0);
              }}
              className={`px-4 py-3 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-[var(--s500)]`}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-70">
              Average ticket (USD)
            </span>
            <input
              type="number"
              min={0}
              max={100_000}
              value={ticket}
              data-testid="roi-input-ticket"
              onFocus={takeOver}
              onChange={(event) => {
                takeOver();
                const next = Number.parseInt(event.target.value, 10);
                setTicket(Number.isFinite(next) ? next : 0);
              }}
              className={`px-4 py-3 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-[var(--s500)]`}
            />
          </label>
        </form>

        <div
          className="flex flex-col justify-between gap-6"
          data-testid="roi-output"
          data-savings-monthly={result.savingsMonthly}
          data-additional-jobs={result.additionalJobsBooked}
          data-payback-months={result.paybackMonths}
        >
          <div>
            <div className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">
              {result.company || 'Your business'} could capture
            </div>
            <div
              className="brand-font text-5xl md:text-6xl font-bold leading-none text-[#5d8c61]"
              data-testid="roi-output-savings"
            >
              {formatCurrency(result.savingsMonthly)}
            </div>
            <div className="mono-font text-[12px] opacity-60 mt-2">
              additional revenue per month
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="mono-font text-[10px] uppercase opacity-60">
                Missed calls / mo
              </dt>
              <dd
                className="brand-font text-2xl font-bold mt-1 text-[#d4524e]"
                data-testid="roi-output-missed"
              >
                {result.missedCallsMonthly.toFixed(0)}
              </dd>
            </div>
            <div>
              <dt className="mono-font text-[10px] uppercase opacity-60">
                Jobs newly booked / mo
              </dt>
              <dd
                className="brand-font text-2xl font-bold mt-1 text-[#5d8c61]"
                data-testid="roi-output-jobs"
              >
                {result.additionalJobsBooked.toFixed(1)}
              </dd>
            </div>
            <div>
              <dt className="mono-font text-[10px] uppercase opacity-60">
                Payback period
              </dt>
              <dd
                className="brand-font text-2xl font-bold mt-1 text-[#5d8c61]"
                data-testid="roi-output-payback"
              >
                {result.paybackMonths > 0
                  ? `${result.paybackMonths.toFixed(1)} mo`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="mono-font text-[10px] uppercase opacity-60">
                Annualized
              </dt>
              <dd
                className="brand-font text-2xl font-bold mt-1 text-[#5d8c61]"
                data-testid="roi-output-annualized"
              >
                {formatCurrency(result.savingsMonthly * 12)}
              </dd>
            </div>
          </dl>

          <p className="text-[11px] opacity-50 mono-font leading-relaxed">
            Estimates only. Real recovery depends on your local market, current
            voicemail flow, and how fast dispatch acts on the handoffs.
          </p>
        </div>
      </div>
    </section>
  );
}
