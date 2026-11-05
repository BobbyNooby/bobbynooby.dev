import { describe, expect, it } from 'vitest';
import { mulberry32, pick, shuffle } from './rng';

describe('mulberry32', () => {
	it('matches the prototype sequence', () => {
		const r = mulberry32(20261104);
		expect(r()).toBeCloseTo(0.6865751853, 10);
		expect(r()).toBeCloseTo(0.0254611892, 10);
		expect(r()).toBeCloseTo(0.6606633463, 10);
	});
});

describe('pick', () => {
	it('scales one draw to the array length', () => {
		expect(pick(mulberry32(20261104), ['a', 'b', 'c'])).toBe('c');
	});
});

describe('shuffle', () => {
	it('runs Fisher-Yates from the end, one draw per swap', () => {
		const rng = mulberry32(20261104);
		expect(shuffle(rng, [1, 2, 3, 4])).toEqual([4, 2, 1, 3]);
		const ref = mulberry32(20261104);
		ref();
		ref();
		ref();
		expect(rng()).toBe(ref());
	});

	it('leaves the input alone', () => {
		const input = [1, 2, 3, 4];
		shuffle(mulberry32(1), input);
		expect(input).toEqual([1, 2, 3, 4]);
	});

	it('draws nothing for zero or one item', () => {
		const rng = mulberry32(20261104);
		expect(shuffle(rng, [])).toEqual([]);
		expect(shuffle(rng, ['x'])).toEqual(['x']);
		expect(rng()).toBeCloseTo(0.6865751853, 10);
	});
});
