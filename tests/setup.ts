/**
 * Vitest global setup file
 * Runs before all test suites
 */

import {beforeAll, afterAll, afterEach, vi} from 'vitest';
// eslint-disable-next-line import-x/no-unassigned-import -- side-effect import: loads env vars before any test runs.
import './test-env';

// React 18+ needs IS_REACT_ACT_ENVIRONMENT before any component renders or
// happy-dom warns "not configured to support act(...)" and act() races,
// intermittently timing out tests that rely on it (e.g. TestimonialGrid).
// Setting it in the shared setup makes the flag present for every test file
// from first import, not after a file-local hook runs.
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

beforeAll(() => {
  console.log('🧪 Starting Vitest test suite...');
});

afterEach(() => {
  // Belt-and-suspenders isolation: a test that forgets to restore fake
  // timers or a stubbed global (matchMedia, fetch) was intermittently
  // breaking later files' synchronous renders (e.g. the testimonials grid,
  // FAQ accordion, ticker fixtures). Reset every shared surface after every
  // test so file/test order can't flake.
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  // Clear any leaked DOM from tests that forgot to unmount.
  if (typeof document !== 'undefined') document.body.innerHTML = '';
});

afterAll(() => {
  console.log('✅ Test suite completed');
});
