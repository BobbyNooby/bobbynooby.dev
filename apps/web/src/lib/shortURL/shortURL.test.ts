import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/db/mongo', () => ({ db: {} }));

const { generateShortURL } = await import('./shortURL');

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

describe('generateShortURL', () => {
	it('produces the requested length from the base62 charset', () => {
		const slug = generateShortURL(5);
		expect(slug).toHaveLength(5);
		for (const ch of slug) expect(CHARSET).toContain(ch);
	});
	it('is deterministic under an injected rng', () => {
		let calls = 0;
		const slug = generateShortURL(4, () => (calls++ % 2 === 0 ? 0 : 61));
		expect(slug).toBe('A9A9');
	});
});
