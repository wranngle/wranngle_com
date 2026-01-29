import {defineConfig} from 'vitest/config';
import path from 'node:path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: ['./tests/setup.ts'],
		exclude: [
			'node_modules/**',
			'dist/**',
			'email-templates/build/**',
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
