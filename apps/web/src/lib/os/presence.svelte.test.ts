import { describe, expect, it, vi } from 'vitest';

const socket = { send: vi.fn(), close: vi.fn() };
vi.mock('$lib/utils/liveSocket', () => ({ createLiveSocket: vi.fn(() => socket) }));
vi.stubGlobal('document', {
	hidden: false,
	addEventListener: vi.fn(),
	removeEventListener: vi.fn()
});

const { PresenceState } = await import('./presence.svelte');

const sent = () => socket.send.mock.calls.map(([msg]) => JSON.parse(msg));

function started() {
	socket.send.mockReset();
	const presence = new PresenceState();
	presence.start(() => 'bob');
	return presence;
}

describe('PresenceState.leave', () => {
	it('takes the cursor down when the pointer leaves the page', () => {
		const presence = started();
		presence.move('about', 0.5, 0.5);
		presence.leave();
		expect(sent()).toEqual([{ t: 'cur', pane: 'about', x: 0.5, y: 0.5 }, { t: 'hide' }]);
	});

	it('sends nothing when the cursor is not shared', () => {
		const presence = started();
		presence.setShare(false);
		socket.send.mockReset();
		presence.leave();
		expect(socket.send).not.toHaveBeenCalled();
	});
});
