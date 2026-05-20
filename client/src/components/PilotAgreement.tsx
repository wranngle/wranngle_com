import React, {useState, useCallback} from 'react';
import {CheckCircle2, FileSignature, Loader2, XCircle} from 'lucide-react';

/**
 * Pilot-agreement click-through. Renders the agreement body (passed as a
 * pre-formatted React node so the page can compose Markdown + custom layout
 * in one place) and an "I agree" button that fires a fire-and-forget
 * `pilot.intent` event at the gtm_ops /api/ticker endpoint.
 *
 * Telemetry contract mirrors PR #74 (gtm_ops /api/ticker telemetry endpoint):
 *   POST /api/ticker
 *   { event, ts, vertical, value_bucket, region, agreement_version }
 *
 * The POST is fire-and-forget — a 4xx/5xx/network failure does NOT block the
 * user-visible "agreement recorded" state, but is surfaced as a non-blocking
 * inline warning so the operator knows the telemetry sink missed it. The
 * legal acceptance is the click; the ticker event is observability.
 */

export const PILOT_AGREEMENT_VERSION = '2026-05-14';
export const PILOT_INTENT_ENDPOINT = '/api/ticker';

export type PilotIntentPayload = {
  event: 'pilot.intent';
  ts: string;
  vertical: string;
  value_bucket: 'pilot';
  region: string;
  agreement_version: string;
};

export type PilotAgreementProps = {
  body: React.ReactNode;
  /** Self-selected vertical from upstream context; defaults to 'unspecified'. */
  vertical?: string;
  /** Broad region from upstream context; defaults to 'unspecified'. */
  region?: string;
  /** Override for tests; defaults to `/api/ticker` (Cloudflare Pages proxy). */
  endpoint?: string;
  /** Injectable fetch for tests. Falls back to globalThis.fetch. */
  fetchImpl?: typeof fetch;
  /** Called after a successful intent post (200-299) for upstream wiring. */
  onAgreed?: (payload: PilotIntentPayload) => void;
};

type SubmissionState =
  | {status: 'idle'}
  | {status: 'submitting'}
  | {status: 'agreed'; telemetryFailed: boolean};

export function buildPilotIntent(opts: {
  vertical?: string;
  region?: string;
  now?: () => Date;
}): PilotIntentPayload {
  const now = opts.now ?? (() => new Date());
  return {
    event: 'pilot.intent',
    ts: now().toISOString(),
    vertical: opts.vertical?.trim() || 'unspecified',
    value_bucket: 'pilot',
    region: opts.region?.trim() || 'unspecified',
    agreement_version: PILOT_AGREEMENT_VERSION,
  };
}

export default function PilotAgreement(props: PilotAgreementProps) {
  const {
    body,
    vertical,
    region,
    endpoint = PILOT_INTENT_ENDPOINT,
    fetchImpl,
    onAgreed,
  } = props;

  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
  });

  const submit = useCallback(async () => {
    if (submission.status !== 'idle') return;
    setSubmission({status: 'submitting'});

    const payload = buildPilotIntent({vertical, region});
    const doFetch = fetchImpl ?? globalThis.fetch.bind(globalThis);

    let telemetryFailed = false;
    try {
      const response = await doFetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
        keepalive: true,
      });
      if (!response.ok) telemetryFailed = true;
    } catch {
      telemetryFailed = true;
    }

    setSubmission({status: 'agreed', telemetryFailed});
    if (!telemetryFailed) onAgreed?.(payload);
  }, [endpoint, fetchImpl, onAgreed, region, submission.status, vertical]);

  const agreed = submission.status === 'agreed';
  const submitting = submission.status === 'submitting';

  return (
    <div
      data-testid="pilot-agreement"
      className="rounded-2xl border border-[var(--s500)]/20 bg-[var(--s100)]/30 p-6 md:p-8"
    >
      <div
        data-testid="pilot-agreement-body"
        className="prose prose-sm md:prose-base max-w-none opacity-90 mb-8"
      >
        {body}
      </div>

      <div
        className="flex flex-col gap-4 border-t border-[var(--s500)]/15 pt-6"
        aria-live="polite"
      >
        {agreed ? (
          <div
            data-testid="pilot-agreement-confirmed"
            className="flex items-start gap-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3"
          >
            <CheckCircle2
              className="h-5 w-5 mt-0.5 text-emerald-500 shrink-0"
              aria-hidden="true"
            />
            <div className="flex flex-col gap-1">
              <p className="font-medium text-emerald-700 dark:text-emerald-300">
                Agreement recorded.
              </p>
              <p className="text-sm opacity-80">
                Pilot intent v{PILOT_AGREEMENT_VERSION} accepted. We&apos;ll
                reach out within one business day to schedule kickoff.
              </p>
              {submission.telemetryFailed ? (
                <p
                  data-testid="pilot-agreement-telemetry-warning"
                  className="text-xs flex items-center gap-1.5 opacity-70 mt-1"
                >
                  <XCircle
                    className="h-3.5 w-3.5 text-amber-500 shrink-0"
                    aria-hidden="true"
                  />
                  Telemetry sink unreachable — your acceptance still counts;
                  we&apos;ll reconcile manually.
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <button
            type="button"
            data-testid="pilot-agreement-agree"
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--s500)] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[var(--s500)]/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <FileSignature className="h-4 w-4" aria-hidden="true" />
            )}
            {submitting ? 'Recording...' : 'I agree'}
          </button>
        )}
        <p className="text-xs opacity-60">
          Clicking <strong>I agree</strong> fires a single anonymized telemetry
          event ({`{event: "pilot.intent"}`}) at /api/ticker. No PII is sent.
          Contact pilot@wranngle.com for a counter-signed PDF variant.
        </p>
      </div>
    </div>
  );
}
