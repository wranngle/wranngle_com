/**
 * Vitest global setup file
 * Runs before all test suites
 */

import {beforeAll, afterAll, afterEach, vi} from 'vitest';
// eslint-disable-next-line import-x/no-unassigned-import -- side-effect import: loads env vars before any test runs.
import './test-env';

beforeAll(() => {
  console.log('🧪 Starting Vitest test suite...');
});

afterEach(() => {
  // Belt-and-suspenders isolation: a test that forgets to restore fake
  // timers or a stubbed global (matchMedia, fetch) was intermittently
  // breaking later files' synchronous renders (e.g. the testimonials grid).
  // Reset the shared surfaces after every test so file order can't flake.
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

afterAll(() => {
  console.log('✅ Test suite completed');
});
