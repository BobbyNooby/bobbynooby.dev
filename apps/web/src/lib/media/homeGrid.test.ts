import { describe, expect, it, vi } from 'vitest';
import type { GeneralMedia } from './mediaTypes';

vi.mock('$lib/db/mongo', () => ({ db: {} }));
vi.mock('./parseMedia', () => ({ parseMedia: vi.fn() }));

const { toGridEntry } = await import('./homeGrid');

const media: GeneralMedia = {
	color: '#e4930d',
	coverImageURL: 'https://s4.anilist.co/cover.jpg',
	details: [
		{
			category: { value: 'Status', color: '#FFFFFF' },
			text: { value: 'Finished', color: '#68D639' }
		}
	],
	titles: [
		{ value: 'GTO: Great Teacher Onizuka', color: '#FFFFFF' },
		{ value: 'Great Teacher Onizuka', color: '#FFFFFF' }
	],
	genres: ['Comedy', 'Drama'],
	description: '<p>Onizuka &amp; class<br>teaches.</p>',
	bobStats: { review: 'he da goat', score: 9.5 },
	url: 'https://anilist.co/anime/245',
	css: { outer: '', inner: '' }
};

describe('toGridEntry', () => {
	it('keeps the shell fields and the window details', () => {
		const e = toGridEntry(
			{ uid: 1, id: 245, label: 'GTO', review: 'he da goat', bobscore: 9.5 },
			media
		);
		expect(e).toEqual({
			label: 'GTO',
			anilistId: 245,
			review: 'he da goat',
			title: 'GTO: Great Teacher Onizuka',
			cover: 'https://s4.anilist.co/cover.jpg',
			color: '#e4930d',
			url: 'https://anilist.co/anime/245',
			altTitles: ['Great Teacher Onizuka'],
			score: 9.5,
			genres: ['Comedy', 'Drama'],
			details: [{ label: 'Status', value: 'Finished', color: '#68D639' }],
			description: 'Onizuka & class\nteaches.'
		});
	});

	it('copes with missing review, cover, colour and titles', () => {
		const e = toGridEntry(
			{ uid: 2, id: '9', label: 'x', bobscore: 0 },
			{ ...media, coverImageURL: '', color: '', titles: [], url: '', description: '' }
		);
		expect(e).toMatchObject({ review: null, cover: null, color: null, title: null, url: null });
		expect(e.altTitles).toEqual([]);
	});

	it('drops blank and duplicate alternative titles', () => {
		const e = toGridEntry(
			{ uid: 3, id: 1, label: 'a', bobscore: 0 },
			{
				...media,
				titles: [
					{ value: 'A', color: '' },
					{ value: '', color: '' },
					{ value: 'B', color: '' },
					{ value: 'B', color: '' }
				]
			}
		);
		expect(e.altTitles).toEqual(['B']);
	});
});
