import { beforeEach, describe, expect, it, vi } from 'vitest';

const song = {
	isPlaying: false,
	title: 'T',
	artist: 'A',
	album: 'B',
	albumImageUrl: 'https://i.scdn.co/x',
	songUrl: 'https://open.spotify.com/track/x',
	playedAt: '2026-01-01T00:00:00.000Z'
};

const { findOne } = vi.hoisted(() => ({ findOne: vi.fn() }));
vi.mock('$lib/db/mongo', () => ({ db: { collection: () => ({ findOne }) } }));

const { GET } = await import('./+server');

const get = () =>
	GET({ request: new Request('http://localhost/api/spotify/last_played') } as Parameters<
		typeof GET
	>[0]);

beforeEach(() => {
	findOne.mockReset();
	// Applies the _id projection the way Mongo would.
	findOne.mockImplementation(async (_query: unknown, options?: { projection?: { _id?: 0 } }) =>
		options?.projection?._id === 0 ? { ...song } : { _id: 'abc123', ...song }
	);
});

describe('GET /api/spotify/last_played', () => {
	it('returns the song without the Mongo _id', async () => {
		const res = await get();
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.data).toEqual(song);
		expect(body.data).not.toHaveProperty('_id');
	});

	it('answers a redacted 500 when the lookup fails', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		findOne.mockRejectedValue(new Error('MongoServerError: auth failed on cluster0'));
		const res = await get();
		expect(res.status).toBe(500);
		await expect(res.json()).resolves.toEqual({ success: false, error: 'internal' });
	});
});
