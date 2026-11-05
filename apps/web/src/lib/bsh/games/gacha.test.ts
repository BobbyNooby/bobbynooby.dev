import { describe, expect, it } from 'vitest';
import { draws } from '../testing';
import type { BshMedia } from '../types';
import { gachaPull } from './gacha';

const media = (label: string, review: string | null = null): BshMedia => ({
	label,
	review,
	anilistId: null,
	title: null,
	cover: null,
	color: null
});
const grid = {
	anime: [media('A')],
	manga: [media('B', 'nice'), media('A very long label for one manga entry')]
};
const box = (inner: number, rows: string[]) => [
	'┌' + '─'.repeat(inner) + '┐',
	...rows.map((r) => '│ ' + r.padEnd(inner - 1) + '│'),
	'└' + '─'.repeat(inner) + '┘'
];
const plain = (lines: { t: string }[][]) => lines.map((l) => l.map((s) => s.t).join(''));

describe('gachaPull', () => {
	it('makes a reviewed entry SSR without a second draw', () => {
		const pull = gachaPull(grid, draws(0.4));
		expect(pull.pulled).toBe(true);
		expect(plain(pull.lines)).toEqual([...box(20, ['★★★  SSR', 'B', 'manga · #1']), '"nice"']);
		expect(pull.lines.slice(0, 5).every((l) => l[0].c === '#facc15')).toBe(true);
		expect(pull.lines[5]).toEqual([{ t: '"nice"', c: '#d1d5db' }]);
	});

	it('makes anything else SR 35% of the time, otherwise R', () => {
		const sr = gachaPull(grid, draws(0, 0.34));
		expect(plain(sr.lines)).toEqual(box(20, ['★★  SR', 'A', 'anime · #1']));
		expect(sr.lines[0][0].c).toBe('#60a5fa');
		const r = gachaPull(grid, draws(0, 0.35));
		expect(plain(r.lines)[1]).toBe('│ ★  R' + ' '.repeat(15) + '│');
		expect(r.lines[0][0].c).toBe('#9ca3af');
	});

	it('widens the box to fit a long label', () => {
		const label = 'A very long label for one manga entry';
		const pull = gachaPull(grid, draws(0.99, 0.9));
		expect(plain(pull.lines)).toEqual(box(label.length + 3, ['★  R', label, 'manga · #2']));
	});

	it('cuts a long review at 88 characters', () => {
		const review = 'x'.repeat(91);
		const pull = gachaPull({ manga: [media('L', review)] }, draws(0));
		expect(pull.lines.at(-1)).toEqual([{ t: '"' + 'x'.repeat(88) + '…"', c: '#d1d5db' }]);
		const fits = gachaPull({ manga: [media('L', 'x'.repeat(90))] }, draws(0));
		expect(fits.lines.at(-1)![0].t).toBe('"' + 'x'.repeat(90) + '"');
	});

	it('pulls nothing from an empty 3x3', () => {
		for (const empty of [{}, { anime: [], manga: [] }]) {
			expect(gachaPull(empty, draws())).toEqual({
				pulled: false,
				lines: [[{ t: 'nothing to pull yet.' }]]
			});
		}
	});
});
