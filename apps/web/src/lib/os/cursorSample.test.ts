import { describe, expect, it } from 'vitest';
import { NET_MS, sample, type CursorSample } from './cursorSample';

const at = (t: number, x: number, y = 0): CursorSample => ({ t, pane: 'about', x, y });
const flat = (s: CursorSample) => ({ x: s.x, y: s.y });

describe('sample', () => {
	it('returns nothing for an empty buffer', () => {
		expect(sample([], 1000, flat)).toBeNull();
	});

	it('holds at the newest sample when nothing newer has arrived', () => {
		const buf = [at(0, 0), at(100, 0.5)];
		expect(sample(buf, 400, flat)).toEqual({ x: 0.5, y: 0 });
	});

	it('blends linearly between the two samples around the render time', () => {
		const buf = [at(0, 0), at(100, 1)];
		expect(sample(buf, 25, flat)).toEqual({ x: 0.25, y: 0 });
		expect(sample(buf, 50, flat)).toEqual({ x: 0.5, y: 0 });
	});

	it('waits at the first sample before it is due', () => {
		expect(sample([at(100, 0.2), at(200, 0.8)], 50, flat)).toEqual({ x: 0.2, y: 0 });
	});

	it('after a rest, holds and then slides across only the last stretch', () => {
		// The mouse sat still for 2s, then moved: don't crawl across the whole gap.
		const buf = [at(0, 0), at(2000, 1)];
		const start = 2000 - NET_MS * 1.5;
		expect(sample(buf, 1000, flat)).toEqual({ x: 0, y: 0 });
		expect(sample(buf, start, flat)).toEqual({ x: 0, y: 0 });
		expect(sample(buf, start + (2000 - start) / 2, flat)).toEqual({ x: 0.5, y: 0 });
	});

	it('uses whichever end can be placed when a pane is gone', () => {
		const buf = [at(0, 0.1), { t: 100, pane: 'twitch', x: 0.9, y: 0 } as CursorSample];
		const toPx = (s: CursorSample) => (s.pane === 'twitch' ? null : flat(s));
		expect(sample(buf, 50, toPx)).toEqual({ x: 0.1, y: 0 });
	});
});
