import { describe, expect, it, vi } from 'vitest';

const findOne = vi.fn();
vi.mock('$lib/db/mongo', () => ({
	db: {
		collection: () => ({ findOne })
	}
}));

const { getKnown3x3Routes } = await import('$lib/db/mongoUtils');

describe('getKnown3x3Routes', () => {
	it('returns lowercased routes from the routes doc', async () => {
		findOne.mockResolvedValue({ routes: ['Anime', 'MANGA'] });
		const routes = await getKnown3x3Routes();
		expect(routes.has('anime')).toBe(true);
		expect(routes.has('manga')).toBe(true);
		expect(routes.has('Anime')).toBe(false);
	});

	it('returns an empty set when the doc is missing', async () => {
		findOne.mockResolvedValue(null);
		const routes = await getKnown3x3Routes();
		expect(routes.size).toBe(0);
	});
});
