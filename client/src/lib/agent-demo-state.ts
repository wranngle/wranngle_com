/**
 * Live-agent call demo: pure state engine.
 *
 * The browser WebRTC + audio subsystem is mocked end-to-end on the
 * homepage demo: no real microphone access, no real signaling. This
 * module owns the deterministic script that the AgentDemoButton plays
 * back so we can render a 90-second scripted call without permissions
 * prompts on first visit.
 *
 * Contract:
 *   - `DEMO_SCRIPT` is the canonical transcript; every entry has an
 *     absolute `tMs` offset from call-start so the UI can drive the
 *     bubbles purely off setTimeout (no audio-clock coupling).
 *   - `tickDemo(state, nowMs)` advances state by revealing every
 *     bubble whose offset is ≤ nowMs. It is a pure reducer: same
 *     input → same output, no globals, no side-effects.
 *   - `nextEventAt(state)` returns the next pending offset, or
 *     `undefined` when the script is exhausted (UI uses this to
 *     schedule the next timer).
 *   - End-of-call surfaces the `email-capture` modal (see `phase`
 *     transition `talking` → `wrap-up` → `email-capture`).
 *
 * Why not real WebRTC? Three reasons: (1) consent dialogs kill the
 * above-fold demo conversion; (2) the homepage is server-rendered to
 * Cloudflare Pages — no signaling backend on the critical path; (3)
 * the script is deterministic, which is what the proof test asserts.
 */

export type DemoSpeaker = 'caller' | 'agent';

export type DemoTranscript = {
  /** Stable id used as React key and assertion target. */
  id: string;
  speaker: DemoSpeaker;
  /** Absolute offset (ms) from call-start at which this bubble appears. */
  tMs: number;
  text: string;
};

export type DemoPhase =
  | 'idle'
  | 'connecting'
  | 'talking'
  | 'wrap-up'
  | 'email-capture';

export type DemoState = {
  phase: DemoPhase;
  /** ms elapsed since the last `startDemo` (frozen once phase is terminal). */
  elapsedMs: number;
  /** Transcripts revealed so far, in script order. */
  revealed: DemoTranscript[];
};

/**
 * 90-second after-hours plumbing call. The vertical mirrors the
 * homepage hero copy ("11 PM, no answer"). Offsets are spaced so a
 * real reader can keep up but are short enough that the e2e test runs
 * sub-second by advancing fake timers.
 */
export const DEMO_SCRIPT: readonly DemoTranscript[] = Object.freeze([
  {
    id: 't01',
    speaker: 'agent',
    tMs: 1500,
    text: 'Thanks for calling — this is the after-hours line. How can I help?',
  },
  {
    id: 't02',
    speaker: 'caller',
    tMs: 6000,
    text: "Hi — water's leaking from under my kitchen sink and I can't shut it off.",
  },
  {
    id: 't03',
    speaker: 'agent',
    tMs: 11_000,
    text: "Got it — that's an emergency. Can I get your name and the service address?",
  },
  {
    id: 't04',
    speaker: 'caller',
    tMs: 17_000,
    text: 'Jamie Carter, 4218 Maple Avenue, Fort Wayne.',
  },
  {
    id: 't05',
    speaker: 'agent',
    tMs: 23_000,
    text: "Thanks Jamie. I'm dispatching the on-call plumber now. ETA is about 35 minutes.",
  },
  {
    id: 't06',
    speaker: 'caller',
    tMs: 31_000,
    text: 'Great — what should I do until they arrive?',
  },
  {
    id: 't07',
    speaker: 'agent',
    tMs: 36_000,
    text: "Shut off the angle stops under the sink if you can reach them; otherwise the main valve. I'll text you a photo guide now.",
  },
  {
    id: 't08',
    speaker: 'caller',
    tMs: 48_000,
    text: 'Perfect, thank you.',
  },
  {
    id: 't09',
    speaker: 'agent',
    tMs: 52_000,
    text: "You're welcome. Stay on the line — I'll confirm the dispatch and send the summary to your phone.",
  },
  {
    id: 't10',
    speaker: 'agent',
    tMs: 80_000,
    text: 'All set — plumber is en route, ticket #4218 emailed to dispatch. Goodbye.',
  },
]);

/** Total scripted call duration (ms), including a brief wrap-up tail. */
export const DEMO_CALL_DURATION_MS = 90_000;
/** Delay between scripted-call end and email-capture modal surfacing. */
export const EMAIL_CAPTURE_DELAY_MS = 1500;
/** Connecting-phase dwell time before the first transcript appears. */
export const CONNECTING_DURATION_MS = 1200;

export function initialDemoState(): DemoState {
  return {phase: 'idle', elapsedMs: 0, revealed: []};
}

export function startDemo(): DemoState {
  return {phase: 'connecting', elapsedMs: 0, revealed: []};
}

/**
 * Advance the demo to `nowMs` elapsed. Pure: returns a new state.
 * Phase transitions are derived from the elapsed offset so callers can
 * fast-forward (e.g., scrub bar, fake timers in tests) without needing
 * to replay every intermediate tick.
 */
export function tickDemo(state: DemoState, nowMs: number): DemoState {
  if (state.phase === 'idle') return state;

  const elapsed = Math.max(0, nowMs);
  const revealed = DEMO_SCRIPT.filter((t) => t.tMs <= elapsed);

  let phase: DemoPhase;
  if (elapsed < CONNECTING_DURATION_MS) {
    phase = 'connecting';
  } else if (elapsed < DEMO_CALL_DURATION_MS) {
    phase = 'talking';
  } else if (elapsed < DEMO_CALL_DURATION_MS + EMAIL_CAPTURE_DELAY_MS) {
    phase = 'wrap-up';
  } else {
    phase = 'email-capture';
  }

  return {phase, elapsedMs: elapsed, revealed};
}

/**
 * Returns the next pending event offset (ms) the caller should wake
 * up at, or `undefined` if the script is exhausted. Used by the
 * component to schedule the next setTimeout without polling.
 */
export function nextEventAt(state: DemoState): number | undefined {
  if (state.phase === 'idle') return undefined;

  const upcoming = DEMO_SCRIPT.find((t) => t.tMs > state.elapsedMs);
  if (upcoming) return upcoming.tMs;

  if (state.elapsedMs < DEMO_CALL_DURATION_MS) return DEMO_CALL_DURATION_MS;
  if (state.elapsedMs < DEMO_CALL_DURATION_MS + EMAIL_CAPTURE_DELAY_MS) {
    return DEMO_CALL_DURATION_MS + EMAIL_CAPTURE_DELAY_MS;
  }

  return undefined;
}

export function isTerminal(state: DemoState): boolean {
  return state.phase === 'email-capture';
}
