/**
 * Live agent call demo contract test.
 *
 * Three concerns mapped to the brief's *Proof* line:
 *   1. WebRTC + audio subsystem is mocked end-to-end. We assert that
 *      `navigator.mediaDevices.getUserMedia`, `RTCPeerConnection`, and
 *      `AudioContext` are never invoked when the demo runs — proof
 *      that "browser WebRTC mock" is honored on the homepage critical
 *      path (no mic permission, no signaling).
 *   2. Clicking Start advances the timers and renders ≥3 transcript
 *      bubbles. (The scripted call has 10 bubbles total over 90s.)
 *   3. End state surfaces the `email-capture` modal once the call +
 *      wrap-up delay elapses.
 *
 * Pattern mirrors PR #78 (roi-calculator.test.tsx): react-dom/client
 * + happy-dom + vitest fake timers; no @testing-library dependency.
 * The component exposes a `now` prop so the scheduler reads the fake
 * clock instead of `Date.now()`, keeping the timer advance and the
 * elapsed-time accounting in lockstep.
 */

import React, {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import AgentDemoButton from '@/components/AgentDemoButton.tsx';
import {
  CONNECTING_DURATION_MS,
  DEMO_CALL_DURATION_MS,
  DEMO_SCRIPT,
  EMAIL_CAPTURE_DELAY_MS,
  initialDemoState,
  isTerminal,
  nextEventAt,
  startDemo,
  tickDemo,
} from '@/lib/agent-demo-state.ts';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// Local numeric aliases. The test file lives outside tsconfig's `include`
// (which scopes to client/src), so the imported numeric constants land as
// `any` under xo's typed-lint pass; pinning them to `number` here keeps
// `restrict-plus-operands` happy without widening lint config.
const CALL_MS: number = DEMO_CALL_DURATION_MS;
const WRAP_MS: number = EMAIL_CAPTURE_DELAY_MS;
const CONNECT_MS: number = CONNECTING_DURATION_MS;
const SCRIPT_THIRD_MS: number = (
  DEMO_SCRIPT as ReadonlyArray<{tMs: number}>
)[2]!.tMs;

describe('agent-demo-state reducer', () => {
  it('exposes a frozen, monotonic script with ≥3 transcript bubbles', () => {
    expect(DEMO_SCRIPT.length).toBeGreaterThanOrEqual(3);
    expect(Object.isFrozen(DEMO_SCRIPT)).toBe(true);

    let last = -1;
    for (const event of DEMO_SCRIPT) {
      expect(event.tMs).toBeGreaterThan(last);
      last = event.tMs;
    }
  });

  it('reveals bubbles in script order as time advances', () => {
    let state = startDemo();
    state = tickDemo(state, 0);
    expect(state.revealed).toHaveLength(0);

    state = tickDemo(state, SCRIPT_THIRD_MS);
    expect(state.revealed.length).toBeGreaterThanOrEqual(3);
    expect(state.phase).toBe('talking');
  });

  it('transitions to email-capture only after call + wrap-up delay', () => {
    let state = tickDemo(startDemo(), CALL_MS - 1);
    expect(state.phase).toBe('talking');

    state = tickDemo(state, CALL_MS);
    expect(state.phase).toBe('wrap-up');

    state = tickDemo(state, CALL_MS + WRAP_MS + 1);
    expect(state.phase).toBe('email-capture');
    expect(isTerminal(state)).toBe(true);
  });

  it('nextEventAt returns undefined once terminal', () => {
    const idle = initialDemoState();
    expect(nextEventAt(idle)).toBeUndefined();

    const terminal = tickDemo(startDemo(), CALL_MS + WRAP_MS + 100);
    expect(nextEventAt(terminal)).toBeUndefined();
  });
});

describe('AgentDemoButton — WebRTC + audio fully mocked', () => {
  let container: HTMLDivElement | undefined;
  let root: Root | undefined;
  let fetchSpy: ReturnType<typeof vi.fn>;
  let getUserMediaSpy: ReturnType<typeof vi.fn>;
  let rtcPeerConnectionSpy: ReturnType<typeof vi.fn>;
  let audioContextSpy: ReturnType<typeof vi.fn>;
  let nowMs: number;
  const fakeNow = () => nowMs;

  function advance(ms: number) {
    nowMs += ms;
    vi.advanceTimersByTime(ms);
  }

  beforeEach(() => {
    vi.useFakeTimers();
    nowMs = 1000;

    getUserMediaSpy = vi.fn();
    rtcPeerConnectionSpy = vi.fn();
    audioContextSpy = vi.fn();
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      configurable: true,
      value: {getUserMedia: getUserMediaSpy},
    });
    (globalThis as Record<string, unknown>).RTCPeerConnection = rtcPeerConnectionSpy;
    (globalThis as Record<string, unknown>).AudioContext = audioContextSpy;

    fetchSpy = vi.fn().mockResolvedValue(new Response('{}', {status: 202}));
    globalThis.fetch = fetchSpy;

    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    container = undefined;
    root = undefined;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders a Start button by default and zero transcript bubbles', () => {
    if (!container) throw new Error('container missing');
    act(() => {
      root = createRoot(container!);
      root.render(<AgentDemoButton isDark={false} now={fakeNow} />);
    });

    const start = container.querySelector<HTMLButtonElement>(
      '[data-testid="agent-demo-start"]',
    );
    expect(start).not.toBeNull();
    expect(
      container.querySelectorAll('[data-testid="agent-demo-bubble"]'),
    ).toHaveLength(0);
  });

  it('clicks Start, advances timers, asserts ≥3 transcript bubbles and ends in email-capture', () => {
    if (!container) throw new Error('container missing');
    act(() => {
      root = createRoot(container!);
      root.render(<AgentDemoButton isDark={false} now={fakeNow} />);
    });

    act(() => {
      container!
        .querySelector<HTMLButtonElement>('[data-testid="agent-demo-start"]')!
        .click();
    });

    // Advance through the connecting phase + far enough to reveal 3+ bubbles.
    act(() => {
      advance(CONNECT_MS + SCRIPT_THIRD_MS + 500);
    });

    const bubbles = container.querySelectorAll(
      '[data-testid="agent-demo-bubble"]',
    );
    expect(bubbles.length).toBeGreaterThanOrEqual(3);

    // Drive to terminal.
    act(() => {
      advance(CALL_MS + WRAP_MS + 500);
    });

    expect(
      container.querySelector('[data-testid="agent-demo-email-capture"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-testid="agent-demo-email-input"]'),
    ).not.toBeNull();
  });

  it('never invokes getUserMedia, RTCPeerConnection, or AudioContext', () => {
    if (!container) throw new Error('container missing');
    act(() => {
      root = createRoot(container!);
      root.render(<AgentDemoButton isDark={false} now={fakeNow} />);
    });

    act(() => {
      container!
        .querySelector<HTMLButtonElement>('[data-testid="agent-demo-start"]')!
        .click();
    });

    act(() => {
      advance(CALL_MS + WRAP_MS + 500);
    });

    expect(getUserMediaSpy).not.toHaveBeenCalled();
    expect(rtcPeerConnectionSpy).not.toHaveBeenCalled();
    expect(audioContextSpy).not.toHaveBeenCalled();
  });

  it('fires one /api/ticker POST on Start with the agent_demo.started payload', () => {
    if (!container) throw new Error('container missing');
    act(() => {
      root = createRoot(container!);
      root.render(<AgentDemoButton isDark={false} now={fakeNow} />);
    });

    act(() => {
      container!
        .querySelector<HTMLButtonElement>('[data-testid="agent-demo-start"]')!
        .click();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('/api/ticker');
    expect(init?.method).toBe('POST');
    const payload = JSON.parse(init?.body as string);
    expect(payload.event).toBe('agent_demo.started');
    expect(payload.vertical).toBe('home-services');
  });
});
