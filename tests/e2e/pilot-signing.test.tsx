/**
 * E2E test for the pilot-agreement signing flow.
 *
 * Asserts the **central product promise** of this feature: when a visitor
 * clicks "I agree", the front end fires exactly one POST against
 * /api/ticker carrying an event=`pilot.intent` payload that conforms to
 * the gtm_ops ticker contract from PR #74. Anything else is decoration.
 *
 * The component is mounted in happy-dom with react-dom's createRoot; the
 * test injects a stubbed fetch so we capture the request without touching
 * the network. Both telemetry-success and telemetry-failure branches are
 * verified — the legal acceptance must persist even when the ticker sink
 * is unreachable.
 */

import React, {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import PilotAgreement, {
  PILOT_AGREEMENT_VERSION,
  PILOT_INTENT_ENDPOINT,
  buildPilotIntent,
  type PilotIntentPayload,
} from '@/components/PilotAgreement.tsx';

type FetchCall = {
  url: string;
  init: RequestInit;
  body: PilotIntentPayload;
};

function makeFetchStub(response: Response): {
  fetchImpl: typeof fetch;
  calls: FetchCall[];
} {
  const calls: FetchCall[] = [];
  const fetchImpl = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : (input as URL).toString();
      const rawBody = init?.body;
      const parsed: unknown =
        typeof rawBody === 'string' ? JSON.parse(rawBody) : {};
      const body = parsed as PilotIntentPayload;
      calls.push({url, init: init ?? {}, body});
      return response;
    },
  ) as unknown as typeof fetch;
  return {fetchImpl, calls};
}

function ok(): Response {
  return new Response('{"ok":true}', {
    status: 200,
    headers: {'content-type': 'application/json'},
  });
}

function serverError(): Response {
  return new Response('upstream down', {status: 503});
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

function clickAgree(): void {
  const button = container.querySelector<HTMLButtonElement>(
    '[data-testid="pilot-agreement-agree"]',
  );
  if (!button) throw new Error('agree button not found in DOM');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', {bubbles: true}));
  });
}

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('buildPilotIntent (payload contract for PR #74)', () => {
  it('produces the exact payload shape consumed by gtm_ops /api/ticker', () => {
    const payload = buildPilotIntent({
      vertical: 'hvac',
      region: 'us-west',
      now: () => new Date('2026-05-14T17:30:00.000Z'),
    });
    expect(payload).toEqual({
      event: 'pilot.intent',
      ts: '2026-05-14T17:30:00.000Z',
      vertical: 'hvac',
      value_bucket: 'pilot',
      region: 'us-west',
      agreement_version: PILOT_AGREEMENT_VERSION,
    });
  });

  it('defaults blank or whitespace vertical/region to "unspecified"', () => {
    const blank = buildPilotIntent({
      now: () => new Date('2026-05-14T00:00:00.000Z'),
    });
    expect(blank.vertical).toBe('unspecified');
    expect(blank.region).toBe('unspecified');

    const whitespace = buildPilotIntent({
      vertical: '   ',
      region: '\t\n',
      now: () => new Date('2026-05-14T00:00:00.000Z'),
    });
    expect(whitespace.vertical).toBe('unspecified');
    expect(whitespace.region).toBe('unspecified');
  });

  it('emits a syntactically valid ISO-8601 UTC timestamp', () => {
    const payload = buildPilotIntent({});
    expect(payload.ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe('PilotAgreement click-through: pilot.intent telemetry', () => {
  it('clicking "I agree" fires exactly one POST /api/ticker with event=pilot.intent', async () => {
    const {fetchImpl, calls} = makeFetchStub(ok());
    const onAgreed = vi.fn();

    act(() => {
      root.render(
        <PilotAgreement
          body={<p>terms</p>}
          vertical="hvac"
          region="us-west"
          fetchImpl={fetchImpl}
          onAgreed={onAgreed}
        />,
      );
    });

    clickAgree();
    await flush();

    expect(calls).toHaveLength(1);
    const [call] = calls;
    expect(call.url).toBe(PILOT_INTENT_ENDPOINT);
    expect(call.init.method).toBe('POST');
    const headers = new Headers(call.init.headers);
    expect(headers.get('content-type')).toBe('application/json');
    expect(call.body.event).toBe('pilot.intent');
    expect(call.body.vertical).toBe('hvac');
    expect(call.body.region).toBe('us-west');
    expect(call.body.value_bucket).toBe('pilot');
    expect(call.body.agreement_version).toBe(PILOT_AGREEMENT_VERSION);
    expect(onAgreed).toHaveBeenCalledTimes(1);
    expect(onAgreed).toHaveBeenCalledWith(call.body);
  });

  it('renders the success confirmation after a 200', async () => {
    const {fetchImpl} = makeFetchStub(ok());
    act(() => {
      root.render(<PilotAgreement body={<p>terms</p>} fetchImpl={fetchImpl} />);
    });

    clickAgree();
    await flush();

    const confirmed = container.querySelector(
      '[data-testid="pilot-agreement-confirmed"]',
    );
    expect(confirmed).not.toBeNull();
    expect(confirmed?.textContent ?? '').toContain('Agreement recorded');
    const warning = container.querySelector(
      '[data-testid="pilot-agreement-telemetry-warning"]',
    );
    expect(warning).toBeNull();
  });

  it('still confirms the agreement on a 503 but surfaces a telemetry warning', async () => {
    const {fetchImpl, calls} = makeFetchStub(serverError());
    const onAgreed = vi.fn();

    act(() => {
      root.render(
        <PilotAgreement
          body={<p>terms</p>}
          fetchImpl={fetchImpl}
          onAgreed={onAgreed}
        />,
      );
    });

    clickAgree();
    await flush();

    expect(calls).toHaveLength(1);
    expect(calls[0].body.event).toBe('pilot.intent');
    const confirmed = container.querySelector(
      '[data-testid="pilot-agreement-confirmed"]',
    );
    expect(confirmed).not.toBeNull();
    const warning = container.querySelector(
      '[data-testid="pilot-agreement-telemetry-warning"]',
    );
    expect(warning).not.toBeNull();
    expect(onAgreed).not.toHaveBeenCalled();
  });

  it('treats a network rejection the same as a 5xx — agreement persists, warning shows', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('network down');
    }) as unknown as typeof fetch;
    act(() => {
      root.render(<PilotAgreement body={<p>terms</p>} fetchImpl={fetchImpl} />);
    });

    clickAgree();
    await flush();

    const confirmed = container.querySelector(
      '[data-testid="pilot-agreement-confirmed"]',
    );
    expect(confirmed).not.toBeNull();
    const warning = container.querySelector(
      '[data-testid="pilot-agreement-telemetry-warning"]',
    );
    expect(warning).not.toBeNull();
  });

  it('is idempotent — a second click does not fire a second telemetry event', async () => {
    const {fetchImpl, calls} = makeFetchStub(ok());
    act(() => {
      root.render(<PilotAgreement body={<p>terms</p>} fetchImpl={fetchImpl} />);
    });

    clickAgree();
    await flush();
    expect(calls).toHaveLength(1);

    const button = container.querySelector<HTMLButtonElement>(
      '[data-testid="pilot-agreement-agree"]',
    );
    expect(button).toBeNull();
    expect(calls).toHaveLength(1);
  });
});
