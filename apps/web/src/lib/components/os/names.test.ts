import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';

const EVIL = '\u202Eevil';
const ctx = {
	os: { focused: 'chat', focus: () => {} },
	chat: {
		username: 'bob',
		messages: [{ name: EVIL, message: 'hi', rank: 'guest', created_at: '2026-11-05T00:00:00Z' }]
	},
	presence: {
		here: 2,
		showOthers: true,
		others: [{ id: 'a', name: EVIL, pane: 'chat', color: '#fff' }],
		buffers: new Map()
	}
};
vi.mock('$lib/os/os.svelte', () => ({ useOs: () => ctx }));

const { default: ChatPane } = await import('./panes/ChatPane.svelte');
const { default: Cursors } = await import('./Cursors.svelte');

// A right-to-left override in a name must not flip the text after it.
describe('names from other visitors', () => {
	it('are isolated in the chat', () => {
		expect(render(ChatPane).body).toContain('&lt;<bdi>' + EVIL + '</bdi>>');
	});

	it('are isolated on cursors', () => {
		expect(render(Cursors, { props: { root: undefined } }).body).toContain(
			'<bdi>' + EVIL + '</bdi>'
		);
	});
});
