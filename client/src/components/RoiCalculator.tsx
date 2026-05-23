import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Calculator} from 'lucide-react';
import {computeRoi, formatCurrency, type RoiResult} from '@/lib/roi.ts';

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
};

const DEFAULT_TICKER_ENDPOINT = '/api/ticker';
const TELEMETRY_DEBOUNCE_MS = 600;

export default function RoiCalculator({
  isDark,
  tickerEndpoint = DEFAULT_TICKER_ENDPOINT,
  initialCompany = 'River North Bistro',
  initialCalls = 80,
  initialTicket = 350,
}: RoiCalculatorProps) {
  const [company, setCompany] = useState(initialCompany);
  const [calls, setCalls] = useState(initialCalls);
  const [ticket, setTicket] = useState(initialTicket);

  const result: RoiResult = useMemo(
    () => computeRoi({company, calls, ticket}),
    [company, calls, ticket],
  );

  const tickerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (globalThis.fetch === undefined) return;
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
      className="py-24 px-6 max-w-7xl mx-auto w-full"
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
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--s500)] to-[var(--v500)]">
            {result.company || 'your business'}
          </span>
          ?
        </h2>
        <p className="opacity-60 text-lg leading-relaxed">
          Plug in your call volume and the average ticket (reservation, booking,
          intake, or service value). We assume 35% of inbound calls are missed
          and that an AI agent picks up 95% of those. About 40% of recovered
          after-hours calls convert. Conservative numbers on purpose.
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
              onChange={(event) => {
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
              onChange={(event) => {
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
              onChange={(event) => {
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
              className="brand-font text-5xl md:text-6xl font-bold leading-none"
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
                className="brand-font text-2xl font-bold mt-1"
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
                className="brand-font text-2xl font-bold mt-1"
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
                className="brand-font text-2xl font-bold mt-1"
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
                className="brand-font text-2xl font-bold mt-1"
                data-testid="roi-output-annualized"
              >
                {formatCurrency(result.savingsMonthly * 12)}
              </dd>
            </div>
          </dl>

          <p className="text-[11px] opacity-50 mono-font leading-relaxed">
            Estimates only. Real recovery depends on your local market, current
            voicemail flow, and how fast dispatch acts on the handoffs. Source
            numbers in <code>client/src/lib/roi.ts</code>.
          </p>
        </div>
      </div>
    </section>
  );
}
