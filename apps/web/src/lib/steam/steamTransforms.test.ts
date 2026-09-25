import { describe, expect, it } from 'vitest';
import {
	mapAchievements,
	mapAppDetails,
	mapOwnedGames,
	type OwnedGameRaw
} from './steamTransforms';

const raw = (over: Partial<OwnedGameRaw>): OwnedGameRaw => ({
	appid: 1,
	name: 'Game',
	img_icon_url: 'abc',
	playtime_forever: 90,
	...over
});

describe('mapOwnedGames', () => {
	it('sorts by hours descending and caps at topN', () => {
		const games = [
			raw({ appid: 1, playtime_forever: 60 }),
			raw({ appid: 2, playtime_forever: 600 }),
			raw({ appid: 3, playtime_forever: 300 })
		];
		const mapped = mapOwnedGames(games, 2);
		expect(mapped.map((g) => g.appid)).toEqual([2, 3]);
	});

	it('maps minutes to floored hours and keeps lastPlayed', () => {
		const [g] = mapOwnedGames(
			[raw({ playtime_forever: 1964 * 60 + 30, rtime_last_played: 100 })],
			5
		);
		expect(g.hours).toBe(1964);
		expect(g.lastPlayed).toBe(100);
		expect(g.capsule).toContain('/steam/apps/1/library_600x900.jpg');
		expect(g.icon).toContain('/steamcommunity/public/images/apps/1/abc.jpg');
	});

	it('handles a missing games array', () => {
		expect(mapOwnedGames(undefined, 16)).toEqual([]);
	});
});

describe('mapAppDetails', () => {
	it('reads the aliased response key and sanitizes the description', () => {
		const body = {
			'999': {
				success: true,
				data: {
					name: 'ELDEN RING',
					short_description: 'Short',
					detailed_description: '<p>Keep</p><script>evil()</script>',
					header_image: 'https://img',
					release_date: { date: '24 Feb, 2022' },
					genres: [{ description: 'RPG' }]
				}
			}
		};
		const d = mapAppDetails(1245620, body);
		expect(d.appid).toBe(1245620);
		expect(d.name).toBe('ELDEN RING');
		expect(d.description).toBe('<p>Keep</p>');
		expect(d.achievements).toEqual({ unlocked: 0, total: 0 });
	});

	it('builds a partial doc when appdetails has no data', () => {
		const d = mapAppDetails(7, { '7': { success: false } });
		expect(d).toEqual({
			appid: 7,
			name: 'Game',
			description: '',
			short: '',
			headerImage: null,
			releaseDate: null,
			genres: [],
			achievements: { unlocked: 0, total: 0 }
		});
	});
});

describe('mapAchievements', () => {
	it('counts unlocked achievements', () => {
		const body = {
			playerstats: { achievements: [{ achieved: 1 }, { achieved: 0 }, { achieved: 1 }] }
		};
		expect(mapAchievements(body)).toEqual({ unlocked: 2, total: 3 });
	});

	it('returns zeroed counts on error bodies', () => {
		expect(mapAchievements({ playerstats: { error: 'PROFILE_ERROR' } })).toEqual({
			unlocked: 0,
			total: 0
		});
	});
});
