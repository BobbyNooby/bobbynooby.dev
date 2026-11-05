import { describe, expect, it, vi } from 'vitest';
import { memoryStorage } from '$lib/bsh/testing';

const socket = { open: true, send: vi.fn(), close: vi.fn(), isOpen: () => socket.open };
vi.mock('$lib/utils/liveSocket', () => ({ createLiveSocket: vi.fn(() => socket) }));
vi.mock('$lib/utils/playAudio', () => ({ playAudio: vi.fn() }));

const { ChatState, loadUsername } = await import('./chat.svelte');

function startedChat() {
	socket.open = true;
	socket.send.mockReset();
	const chat = new ChatState();
	chat.start();
	return chat;
}

describe('ChatState.send', () => {
	it('sends through the socket when it is open', () => {
		const chat = startedChat();
		expect(chat.send('bob', 'hi')).toBe('sent');
		expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ name: 'bob', message: 'hi' }));
	});

	it('reports offline instead of dropping the message silently', () => {
		const chat = startedChat();
		socket.open = false;
		expect(chat.send('bob', 'hi')).toBe('offline');
		expect(socket.send).not.toHaveBeenCalled();
	});

	it('stops at the same rate the server allows: 5, then one every 2s', () => {
		const chat = startedChat();
		const results = Array.from({ length: 6 }, () => chat.send('bob', 'hi'));
		expect(results).toEqual(['sent', 'sent', 'sent', 'sent', 'sent', 'too-fast']);
		expect(socket.send).toHaveBeenCalledTimes(5);
	});

	it('rejects a message the server would refuse', () => {
		const chat = startedChat();
		expect(chat.send('bob', 'x'.repeat(5000))).toBe('invalid');
		expect(socket.send).not.toHaveBeenCalled();
	});

	it('tells the chat box why a message did not go', () => {
		const chat = startedChat();
		socket.open = false;
		chat.submit('hello');
		expect(chat.messages.at(-1)?.message).toBe('/Chat is reconnecting. Try again in a moment.');
	});
});

describe('ChatState.submit', () => {
	it('says true only when the message was sent', () => {
		const chat = startedChat();
		expect(chat.submit('hello')).toBe(true);
		socket.open = false;
		expect(chat.submit('hello')).toBe(false);
		socket.open = true;
		expect(chat.submit('x'.repeat(5000))).toBe(false);
		expect(chat.submit('   ')).toBe(false);
	});

	it('says false when sending too fast', () => {
		const chat = startedChat();
		const results = Array.from({ length: 6 }, () => chat.submit('hi'));
		expect(results).toEqual([true, true, true, true, true, false]);
	});

	it('says true for a rename and false when the rename had no name', () => {
		const chat = startedChat();
		expect(chat.submit('/username bob')).toBe(true);
		expect(chat.username).toBe('bob');
		expect(chat.submit('/username')).toBe(false);
		expect(chat.messages.at(-1)?.message).toBe('Usage: /username <name>');
	});
});

describe('loadUsername', () => {
	it('keeps a saved name, capped at 24 characters', () => {
		expect(loadUsername(memoryStorage({ username: 'bob' }))).toBe('bob');
		expect(loadUsername(memoryStorage({ username: 'n'.repeat(60) }))).toBe('n'.repeat(24));
	});

	it('mints and saves a guest name when there is none', () => {
		const mem = memoryStorage();
		const name = loadUsername(mem);
		expect(name).toMatch(/^Guest_\d{4}$/);
		expect(mem.getItem('username')).toBe(name);
	});

	it('still returns a guest name without storage', () => {
		expect(loadUsername(null)).toMatch(/^Guest_\d{4}$/);
	});
});
