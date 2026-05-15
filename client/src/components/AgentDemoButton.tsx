import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Mic, MicOff, Phone, PhoneOff} from 'lucide-react';
import {
  CONNECTING_DURATION_MS,
  DEMO_CALL_DURATION_MS,
  EMAIL_CAPTURE_DELAY_MS,
  initialDemoState,
  isTerminal,
  nextEventAt,
  startDemo,
  tickDemo,
  type DemoState,
} from '@/lib/agent-demo-state.ts';

/**
 * Above-the-fold live agent call demo. A click on "Talk to the agent"
 * walks through a scripted 90-second after-hours plumbing call entirely
 * in the browser — no microphone permission, no signaling backend, no
 * real WebRTC. The demo is driven by the pure reducer in
 * `@/lib/agent-demo-state.ts` so test runs are deterministic and the
 * UI render stays decoupled from any audio clock.
 *
 * Telemetry: a single `/api/ticker` POST fires on Start so the same
 * back-end that powers the live booking ticker (round-1 PR #74) also
 * records homepage-demo engagement. Failures are swallowed; the
 * customer never blocks on analytics.
 *
 * Sibling above-fold component conventions (rounded-md border,
 * isDark-aware surfaces) mirror the case-study video block shipped in
 * round-1 PR #77.
 */

type AgentDemoButtonProps = {
  isDark: boolean;
  /** Override the telemetry endpoint (tests pass a fake URL). */
  tickerEndpoint?: string;
  /** Override the timer source — exposes the demo to vitest fake timers. */
  now?: () => number;
};

const DEFAULT_TICKER_ENDPOINT = '/api/ticker';
const SCHEDULER_TAIL_MS = 50;

export default function AgentDemoButton({
  isDark,
  tickerEndpoint = DEFAULT_TICKER_ENDPOINT,
  now = () => Date.now(),
}: AgentDemoButtonProps) {
  const [state, setState] = useState<DemoState>(() => initialDemoState());
  const startedAtRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearScheduledTick = useCallback(() => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const fireStartTelemetry = useCallback(() => {
    if (globalThis.fetch === undefined) return;
    try {
      void fetch(tickerEndpoint, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          event: 'agent_demo.started',
          vertical: 'home-services',
          value_bucket: '5-25k',
          region: 'us-midwest',
        }),
        keepalive: true,
      }).catch(() => {
        // Telemetry never blocks render; failures are swallowed.
      });
    } catch {
      // fetch threw synchronously (e.g., SSR) — ignore.
    }
  }, [tickerEndpoint]);

  const advance = useCallback(() => {
    if (startedAtRef.current === undefined) return;
    const elapsed = now() - startedAtRef.current;
    const next = tickDemo(
      {phase: 'connecting', elapsedMs: 0, revealed: []},
      elapsed,
    );
    setState(next);
    if (isTerminal(next)) {
      clearScheduledTick();
      return;
    }

    const wakeAt = nextEventAt(next);
    if (wakeAt === undefined) {
      clearScheduledTick();
      return;
    }

    const delay = Math.max(0, wakeAt - elapsed) + SCHEDULER_TAIL_MS;
    clearScheduledTick();
    timerRef.current = setTimeout(advance, delay);
  }, [clearScheduledTick, now]);

  const onStart = useCallback(() => {
    fireStartTelemetry();
    startedAtRef.current = now();
    setState(startDemo());
    clearScheduledTick();
    timerRef.current = setTimeout(advance, CONNECTING_DURATION_MS / 2);
  }, [advance, clearScheduledTick, fireStartTelemetry, now]);

  const onCancel = useCallback(() => {
    clearScheduledTick();
    startedAtRef.current = undefined;
    setState(initialDemoState());
  }, [clearScheduledTick]);

  useEffect(() => clearScheduledTick, [clearScheduledTick]);

  const isLive = state.phase !== 'idle';
  const showEmailCapture = state.phase === 'email-capture';

  const phaseLabel = useMemo(() => {
    switch (state.phase) {
      case 'idle': {
        return 'Idle';
      }

      case 'connecting': {
        return 'Connecting…';
      }

      case 'talking': {
        return 'Live with the agent';
      }

      case 'wrap-up': {
        return 'Wrapping up';
      }

      case 'email-capture': {
        return 'Call complete';
      }
    }
  }, [state.phase]);

  return (
    <section
      id="agent-demo"
      data-testid="agent-demo"
      aria-label="Live agent call demo"
      className={`mt-8 max-w-xl rounded-md border ${
        isDark
          ? 'border-white/10 bg-white/[0.03] text-[#fcfaf5]'
          : 'border-black/10 bg-white/60 text-[#12111a]'
      }`}
    >
      <header className="flex items-center justify-between px-4 py-3 border-b border-inherit">
        <div className="flex items-center gap-2">
          {isLive ? (
            <Mic className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          ) : (
            <MicOff className="w-4 h-4 opacity-50" aria-hidden="true" />
          )}
          <span className="text-sm font-medium" data-testid="agent-demo-phase">
            {phaseLabel}
          </span>
        </div>
        {isLive ? (
          <button
            type="button"
            onClick={onCancel}
            aria-label="End demo call"
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-current opacity-80 hover:opacity-100"
          >
            <PhoneOff className="w-3.5 h-3.5" aria-hidden="true" />
            End
          </button>
        ) : (
          <button
            type="button"
            onClick={onStart}
            data-testid="agent-demo-start"
            aria-label="Start agent call demo"
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            Talk to the agent
          </button>
        )}
      </header>

      <div
        className="px-4 py-3 min-h-[6rem] space-y-2 text-sm"
        data-testid="agent-demo-transcript"
        aria-live="polite"
      >
        {state.revealed.length === 0 && !isLive ? (
          <p className="opacity-70">
            Click <span className="font-medium">Talk to the agent</span> to
            watch a 90-second scripted after-hours call. No microphone or signup
            — the audio is mocked.
          </p>
        ) : null}
        {state.revealed.length === 0 && state.phase === 'connecting' ? (
          <p className="opacity-70" data-testid="agent-demo-connecting">
            Dialing the agent…
          </p>
        ) : null}
        {state.revealed.map((bubble) => (
          <div
            key={bubble.id}
            data-testid="agent-demo-bubble"
            data-speaker={bubble.speaker}
            className={`rounded px-3 py-2 ${
              bubble.speaker === 'agent'
                ? isDark
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-emerald-500/10 border border-emerald-500/30'
                : isDark
                  ? 'bg-white/[0.04] border border-white/10'
                  : 'bg-black/[0.03] border border-black/10'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1">
              {bubble.speaker === 'agent' ? 'Agent · Sarah' : 'Caller'}
            </div>
            <div className="leading-snug">{bubble.text}</div>
          </div>
        ))}
      </div>

      {showEmailCapture ? (
        <div
          role="dialog"
          aria-label="Get the full transcript"
          data-testid="agent-demo-email-capture"
          className={`px-4 py-3 border-t ${
            isDark ? 'border-white/10' : 'border-black/10'
          }`}
        >
          <p className="text-sm font-medium mb-2">
            Want the full transcript + summary by email?
          </p>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <input
              type="email"
              required
              data-testid="agent-demo-email-input"
              placeholder="you@yourcompany.com"
              className={`flex-1 px-2.5 py-1.5 rounded border text-sm ${
                isDark
                  ? 'border-white/10 bg-white/[0.05]'
                  : 'border-black/10 bg-white'
              }`}
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-emerald-500 text-white text-sm hover:bg-emerald-600"
            >
              Send
            </button>
          </form>
          <p className="mt-2 text-xs opacity-60">
            No spam — this is a static demo. Wire to your CRM via{' '}
            <code>/api/leads</code> in production.
          </p>
        </div>
      ) : null}

      <footer className="px-4 py-2 border-t text-[10px] opacity-60 border-inherit flex items-center justify-between">
        <span>
          WebRTC + audio mocked on-device · script duration ≈{' '}
          {Math.round(DEMO_CALL_DURATION_MS / 1000)}s
        </span>
        <span data-testid="agent-demo-elapsed">
          {Math.min(
            Math.round(state.elapsedMs / 1000),
            Math.round((DEMO_CALL_DURATION_MS + EMAIL_CAPTURE_DELAY_MS) / 1000),
          )}
          s
        </span>
      </footer>
    </section>
  );
}
