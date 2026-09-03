import { resolve } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	resolve: {
		alias: {
			$lib: resolve('./src/lib')
		}
	},
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts']
	}
});
