import type { ShellView } from '$lib/os/shell.svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Shell from './Shell.svelte';

describe('Shell', () => {
	it('caps what can be typed or pasted into the prompt', () => {
		const view = { title: '~', prompt: '~$', lines: [], ready: true } as unknown as ShellView;
		expect(render(Shell, { props: { view } }).body).toMatch(
			/<input[^>]*maxlength="2000"[^>]*aria-label="Shell command"/
		);
	});
});
