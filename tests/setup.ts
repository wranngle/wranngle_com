/**
 * Vitest global setup file
 * Runs before all test suites
 */

import {beforeAll, afterAll, afterEach} from 'vitest';

// Load environment variables
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
