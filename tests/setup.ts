/**
 * Vitest global setup file
 * Runs before all test suites
 */

import {beforeAll, afterAll, afterEach} from 'vitest';
// eslint-disable-next-line import-x/no-unassigned-import -- side-effect import: loads env vars before any test runs.
import './test-env';

beforeAll(() => {
  console.log('🧪 Starting Vitest test suite...');
});

afterEach(() => {
  // Clean up after each test
});

afterAll(() => {
  console.log('✅ Test suite completed');
});
