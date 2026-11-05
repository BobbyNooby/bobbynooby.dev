import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findOne, countDocuments, insertOne } = vi.hoisted(() => ({
	findOne: vi.fn(),
	countDocuments: vi.fn(),
	insertOne: vi.fn()
}));
vi.mock('$lib/db/mongo', () => ({
	db: { collection: () => ({ findOne, countDocuments, insertOne }) }
}));

const { createShortURL, generateShortURL } = await import('./shortURL');

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

beforeEach(() => {
	findOne.mockReset();
	countDocuments.mockReset();
	insertOne.mockReset();
});

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

describe('createShortURL', () => {
	it('hands back the existing code when the link was shortened before', async () => {
		findOne.mockResolvedValue({ shortURL: 'Old12', longURL: 'https://example.com/' });
		await expect(createShortURL('https://example.com/')).resolves.toEqual({
			success: true,
			shortURL: 'Old12'
		});
		expect(findOne).toHaveBeenCalledWith({ longURL: 'https://example.com/' });
		expect(insertOne).not.toHaveBeenCalled();
	});

	it('stores a new code for a new link', async () => {
		findOne.mockResolvedValue(null);
		countDocuments.mockResolvedValue(0);
		insertOne.mockResolvedValue({ acknowledged: true });
		const result = await createShortURL('https://example.com/new');
		expect(result).toMatchObject({ success: true });
		expect(insertOne).toHaveBeenCalledWith({
			shortURL: result.shortURL,
			longURL: 'https://example.com/new'
		});
	});
});
