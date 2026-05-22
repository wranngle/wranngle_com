/**
 * Live-ticker widget proof.
 *
 * Project uses vitest + happy-dom (no Playwright is wired into this repo),
 * so we substitute a DOM-mount vitest suite for what the feature plan calls
 * a "Playwright snapshot test". The three required assertions hold:
 *   1. renders 10 rows from fixtures when offline
 *   2. gracefully degrades when the upstream returns 503
 *   3. structural snapshot of the rendered ticker
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import React, {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import Ticker from '../../client/src/components/Ticker.tsx';

// React 18+ requires this flag for createRoot test mounts to silence the
// "current testing environment is not configured to support act(...)" warning.
(
  globalThis as unknown as {IS_REACT_ACT_ENVIRONMENT: boolean}
).IS_REACT_ACT_ENVIRONMENT = true;

const ENDPOINT = 'https://app.wranngle.com/api/ticker';

let container: HTMLDivElement;
let root: Root;

async function flush() {
  // happy-dom microtask + a tick for the useEffect-spawned fetch to settle.
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

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
  vi.restoreAllMocks();
});

describe('Ticker — offline / fixture render', () => {
  it('renders 10 rows from fixtures when the network call fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );

    await act(async () => {
      root.render(React.createElement(Ticker, {isDark: false}));
      await flush();
    });

    const rows = container.querySelectorAll('[data-testid="ticker-row"]');
    expect(rows).toHaveLength(10);

    const widget = container.querySelector('[data-testid="ticker-widget"]');
    expect(widget?.getAttribute('data-degraded')).toBe('true');
  });
});

describe('Ticker — 503 graceful degradation', () => {
  it('still renders 10 fixture rows when the upstream returns 503', async () => {
    const fetchMock = vi.fn(
      async () => new Response('upstream unavailable', {status: 503}),
    );
    vi.stubGlobal('fetch', fetchMock);

    await act(async () => {
      root.render(React.createElement(Ticker, {isDark: false}));
      await flush();
    });

    expect(fetchMock).toHaveBeenCalledWith(ENDPOINT, expect.any(Object));

    const rows = container.querySelectorAll('[data-testid="ticker-row"]');
    expect(rows).toHaveLength(10);

    const widget = container.querySelector('[data-testid="ticker-widget"]');
    expect(widget?.getAttribute('data-degraded')).toBe('true');
  });
});

describe('Ticker — happy path with upstream payload', () => {
  it('renders the live events when the API returns a valid array', async () => {
    const payload = Array.from({length: 10}).map((_, i) => ({
      ts: new Date(Date.now() - i * 60_000).toISOString(),
      vertical: `vert-${i}`,
      value_bucket: i % 3 === 0 ? '25k+' : i % 3 === 1 ? '5-25k' : '<5k',
      region: i % 2 === 0 ? 'us-west' : 'us-east',
    }));

    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify(payload), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
          }),
      ),
    );

    await act(async () => {
      root.render(React.createElement(Ticker, {isDark: false}));
      await flush();
    });

    const rows = container.querySelectorAll('[data-testid="ticker-row"]');
    expect(rows).toHaveLength(10);

    const widget = container.querySelector('[data-testid="ticker-widget"]');
    expect(widget?.getAttribute('data-degraded')).toBe('false');
    expect(container.textContent).toContain('vert-0');
    expect(container.textContent).toContain('vert-9');
  });
});

describe('Ticker — structural snapshot', () => {
  it('matches the stable structural shape (heading, ordered list, 10 rows)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline for snapshot');
      }),
    );

    await act(async () => {
      root.render(React.createElement(Ticker, {isDark: false}));
      await flush();
    });

    const structure = {
      heading:
        container.querySelector('#ticker-heading')?.textContent?.trim() ?? '',
      list: container.querySelector('ol')?.tagName ?? '',
      rowCount: container.querySelectorAll('[data-testid="ticker-row"]').length,
      degraded:
        container
          .querySelector('[data-testid="ticker-widget"]')
          ?.getAttribute('data-degraded') ?? '',
    };

    expect(structure).toEqual({
      heading: 'SAMPLE BOOKINGS // ANONYMIZED',
      list: 'OL',
      rowCount: 10,
      degraded: 'true',
    });
  });
});
