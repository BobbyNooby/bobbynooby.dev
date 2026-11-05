import { describe, expect, it } from 'vitest';
import { draws } from '../testing';
import type { BshMedia } from '../types';
import { fortune } from './fortune';

const media = (label: string, review: string | null, title: string | null = null): BshMedia => ({
	label,
	review,
	title,
	anilistId: null,
	cover: null,
	color: null
});

describe('fortune', () => {
	const grid = {
		anime: [media('A', null), media('B', 'first', 'B Full Title')],
		manga: [media('C', 'second')]
	};

	it('quotes a random review, signed with its title', () => {
		expect(fortune(grid, draws(0))).toEqual([
			[{ t: '"first"', c: '#f5f5f5' }],
			[{ t: '   — bobby on B Full Title', c: '#9ca3af' }]
		]);
	});

	it('signs with the label when there is no title', () => {
		expect(fortune(grid, draws(0.5))[1]).toEqual([{ t: '   — bobby on C', c: '#9ca3af' }]);
	});

	it('has no fortunes without reviews', () => {
		const empties: Record<string, BshMedia[]>[] = [{}, { anime: [media('A', null)] }];
		for (const empty of empties) {
			expect(fortune(empty, draws())).toEqual([[{ t: 'no fortunes yet.' }]]);
		}
	});
});
