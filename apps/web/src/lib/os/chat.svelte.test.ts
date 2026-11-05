import { describe, expect, it, vi } from 'vitest';
import { memoryStorage } from '$lib/bsh/testing';

vi.mock('$lib/utils/liveSocket', () => ({ createLiveSocket: vi.fn() }));
vi.mock('$lib/utils/playAudio', () => ({ playAudio: vi.fn() }));

const { loadUsername } = await import('./chat.svelte');

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
