import { describe, expect, it } from 'vitest';
import { mulberry32 } from './rng';

describe('mulberry32', () => {
	it('matches the prototype sequence', () => {
		const r = mulberry32(20261104);
		expect(r()).toBeCloseTo(0.6865751853, 10);
		expect(r()).toBeCloseTo(0.0254611892, 10);
		expect(r()).toBeCloseTo(0.6606633463, 10);
	});
});
