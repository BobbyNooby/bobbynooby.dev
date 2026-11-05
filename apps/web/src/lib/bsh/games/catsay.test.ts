import { describe, expect, it } from 'vitest';
import { textOf } from '../testing';
import { CAT_ART, catsay } from './catsay';

const bubble = (msg: string) => textOf(catsay(msg)).split('\n').slice(0, -CAT_ART.length);

describe('catsay', () => {
	it('draws a one-line bubble over the cat', () => {
		const lines = catsay('hi there');
		expect(textOf(lines).split('\n')).toEqual([
			' __________',
			'< hi there >',
			' ----------',
			...CAT_ART
		]);
		expect(lines.slice(-CAT_ART.length).every((l) => l[0].c === '#f5f5f5')).toBe(true);
		expect(lines[1][0].c).toBeUndefined();
	});

	it('wraps at 32 characters with / | \\ edges', () => {
		const msg = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen';
		expect(bubble(msg)).toEqual([
			' ' + '_'.repeat(29),
			'/ one two three four five six \\',
			'| seven eight nine ten eleven |',
			'\\ twelve thirteen fourteen    /',
			' ' + '-'.repeat(29)
		]);
	});

	it('survives a huge paste', () => {
		const lines = catsay('honk '.repeat(1_000_000));
		expect(lines[1][0].t).toBe('/ ' + 'honk '.repeat(6).trim() + ' \\');
	});

	it('says honk when given nothing', () => {
		for (const msg of ['', '   ']) expect(bubble(msg)[1]).toBe('< honk >');
	});

	it('keeps an over-long first word on the first line', () => {
		const long = 'x'.repeat(40);
		expect(bubble(long + ' y')).toEqual([
			' ' + '_'.repeat(42),
			'/ ' + long + ' \\',
			'\\ ' + 'y'.padEnd(40) + ' /',
			' ' + '-'.repeat(42)
		]);
	});
});
