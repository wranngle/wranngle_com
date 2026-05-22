import React, {useEffect, useState} from 'react';
import {Activity} from 'lucide-react';

/**
 * Live-ticker widget that consumes the `gtm_ops` /api/ticker feed and renders
 * the last 10 anonymized booking events. Falls back to deterministic fixture
 * rows when offline OR when the upstream endpoint returns a non-2xx (incl.
 * 503), so the widget is never empty on a cold-start preview.
 *
 * Contract (mirrors gtm_ops/lib/ticker.ts):
 *   { ts, vertical, value_bucket, region }
 * PII-free by construction; this widget never reads any other fields.
 */

export type ValueBucket = '<5k' | '5-25k' | '25k+';

export type TickerEvent = {
  ts: string;
  vertical: string;
  value_bucket: ValueBucket;
  region: string;
};

type TickerProps = {
  isDark: boolean;
  /**
   * Override the upstream endpoint. Defaults to the production gtm_ops
   * deployment so the widget renders the same feed on local dev and on
   * preview deploys without per-env wiring.
   */
  endpoint?: string;
};

const DEFAULT_ENDPOINT = 'https://app.wranngle.com/api/ticker';
const FETCH_TIMEOUT_MS = 4000;

// Deterministic fixture — keeps the widget non-empty when offline / 503 /
// initial paint. Timestamps are baked relative to mount so a drive-by reader
// always sees "fresh" activity. The shape exactly matches the upstream
// contract from gtm_ops/lib/ticker.ts.
const FIXTURE_ROWS: Array<Omit<TickerEvent, 'ts'> & {minutesAgo: number}> = [
  {
    minutesAgo: 2,
    vertical: 'home-services',
    value_bucket: '5-25k',
    region: 'us-west',
  },
  {minutesAgo: 7, vertical: 'dental', value_bucket: '25k+', region: 'us-south'},
  {
    minutesAgo: 14,
    vertical: 'auto-repair',
    value_bucket: '<5k',
    region: 'us-midwest',
  },
  {
    minutesAgo: 21,
    vertical: 'legal',
    value_bucket: '5-25k',
    region: 'us-northeast',
  },
  {
    minutesAgo: 33,
    vertical: 'hospitality',
    value_bucket: '25k+',
    region: 'us-west',
  },
  {
    minutesAgo: 48,
    vertical: 'logistics',
    value_bucket: '<5k',
    region: 'us-south',
  },
  {
    minutesAgo: 62,
    vertical: 'fitness',
    value_bucket: '5-25k',
    region: 'us-midwest',
  },
  {
    minutesAgo: 81,
    vertical: 'real-estate',
    value_bucket: '25k+',
    region: 'us-northeast',
  },
  {
    minutesAgo: 95,
    vertical: 'veterinary',
    value_bucket: '5-25k',
    region: 'us-west',
  },
  {
    minutesAgo: 118,
    vertical: 'insurance',
    value_bucket: '<5k',
    region: 'us-south',
  },
];

function buildFixtureEvents(baseTimeMs: number = Date.now()): TickerEvent[] {
  return FIXTURE_ROWS.map((row) => ({
    ts: new Date(baseTimeMs - row.minutesAgo * 60_000).toISOString(),
    vertical: row.vertical,
    value_bucket: row.value_bucket,
    region: row.region,
  }));
}

function relativeMinutes(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'just now';
  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function bucketLabel(bucket: ValueBucket): string {
  if (bucket === '<5k') return '<$5k';
  if (bucket === '5-25k') return '$5-25k';
  return '$25k+';
}

function bucketBadgeClass(bucket: ValueBucket, isDark: boolean): string {
  if (bucket === '25k+')
    return isDark
      ? 'bg-[var(--v500)]/20 text-[var(--v500)]'
      : 'bg-[var(--v500)]/10 text-[var(--v500)]';
  if (bucket === '5-25k')
    return isDark
      ? 'bg-[var(--s500)]/20 text-[var(--s500)]'
      : 'bg-[var(--s500)]/10 text-[var(--s500)]';
  return isDark ? 'bg-white/10 text-white/80' : 'bg-black/10 text-black/80';
}

export default function Ticker({
  isDark,
  endpoint = DEFAULT_ENDPOINT,
}: TickerProps) {
  const [events, setEvents] = useState<TickerEvent[]>(() =>
    buildFixtureEvents(),
  );
  const [degraded, setDegraded] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timer = globalThis.setTimeout(() => {
      controller.abort();
    }, FETCH_TIMEOUT_MS);

    (async () => {
      try {
        const res = await fetch(endpoint, {
          headers: {Accept: 'application/json'},
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`ticker ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        if (!Array.isArray(json)) throw new Error('ticker payload not array');
        const valid: TickerEvent[] = [];
        for (const raw of json) {
          if (!raw || typeof raw !== 'object') continue;
          const r = raw as Record<string, unknown>;
          if (
            typeof r.ts === 'string' &&
            typeof r.vertical === 'string' &&
            (r.value_bucket === '<5k' ||
              r.value_bucket === '5-25k' ||
              r.value_bucket === '25k+') &&
            typeof r.region === 'string'
          ) {
            valid.push({
              ts: r.ts,
              vertical: r.vertical,
              value_bucket: r.value_bucket,
              region: r.region,
            });
          }
        }

        if (valid.length === 0) throw new Error('ticker payload empty');
        setEvents(valid.slice(0, 10));
        setDegraded(false);
      } catch {
        // Network error, 503, abort, malformed payload — silently degrade
        // to fixtures so the widget never goes dark.
        if (!cancelled) setDegraded(true);
      } finally {
        globalThis.clearTimeout(timer);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      globalThis.clearTimeout(timer);
    };
  }, [endpoint]);

  return (
    <section
      aria-labelledby="ticker-heading"
      data-testid="ticker-widget"
      data-degraded={degraded ? 'true' : 'false'}
      className={`relative rounded-[20px_4px_20px_4px] border-y border-r border-l-4 border-l-[var(--s500)] noise-overlay ${
        isDark
          ? 'border-white/10 bg-[#18181b] text-[#fcfaf5]'
          : 'border-black/5 bg-white text-[#12111a]'
      }`}
      style={{boxShadow: 'var(--shadow-card)'}}
    >
      <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 border-b border-current/10">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2 w-2 rounded-full ${
              degraded ? 'bg-[var(--s500)]' : 'bg-green-500 animate-pulse'
            }`}
          />
          <h2
            id="ticker-heading"
            className="mono-font text-[10px] font-bold uppercase tracking-widest text-[var(--s500)]"
          >
            {degraded
              ? 'SAMPLE BOOKINGS // ANONYMIZED'
              : 'LIVE BOOKINGS // ANONYMIZED'}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] mono-font opacity-60">
          <Activity size={11} aria-hidden />
          <span>{degraded ? 'sample activity' : `last ${events.length}`}</span>
        </div>
      </header>

      <ol className="divide-y divide-current/10">
        {events.map((event, index) => (
          <li
            key={`${event.ts}-${index}`}
            data-testid="ticker-row"
            className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="mono-font text-[10px] opacity-50 tabular-nums w-16 shrink-0">
                {relativeMinutes(event.ts)}
              </span>
              <span className="font-bold truncate">{event.vertical}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`mono-font text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${bucketBadgeClass(event.value_bucket, isDark)}`}
              >
                {bucketLabel(event.value_bucket)}
              </span>
              <span className="mono-font text-[10px] opacity-50 uppercase tracking-wider">
                {event.region}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
