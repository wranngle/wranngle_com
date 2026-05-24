import {defineConfig} from 'vitest/config';
import path from 'node:path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: ['./tests/setup.ts'],
		// Many tests share happy-dom's single document + mutate fetch / matchMedia
		// / fake-timers; running them in parallel makes a flake roulette
		// (stripe-webhook, testimonials, ticker each failed intermittently).
		// Disable file-level parallelism so each test file has the doc + globals
		// to itself. Wall-clock cost is ~3-4s total.
		fileParallelism: false,
		// Some happy-dom renders (TestimonialGrid in particular) intermittently
		// stall the first time React boots in a fresh fork; the default 5s
		// timeout caught them ~1 in 5. 15s gives genuine slow paths room
		// without masking real hangs.
		testTimeout: 15_000,
		exclude: [
			'node_modules/**',
			'dist/**',
			'email-templates/build/**',
			// Git worktrees live under .claude/worktrees/ and contain a full
			// duplicate of the repo; scanning them surfaces Bun-only tests
			// (e.g. email-templates/build/*.test.ts uses bun:test) that
			// vitest can't load and that already pass their own gates.
			'.claude/worktrees/**',
		],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'tests/',
				'dist/',
				'client/dist/',
				'*.config.ts',
			],
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './client/src'),
			'@shared': path.resolve(__dirname, './shared'),
		},
	},
});
