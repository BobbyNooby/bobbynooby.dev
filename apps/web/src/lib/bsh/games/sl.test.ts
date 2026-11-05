import { describe, expect, it } from 'vitest';
import { slFrames } from './sl';

describe('slFrames', () => {
	it('runs the cat two columns a frame, 0 to 34', () => {
		const frames = slFrames();
		expect(frames).toHaveLength(18);
		expect(frames[0]).toBe('=^@.@^=  ~');
		expect(frames[1]).toBe('  =^@.@^=  ~');
		expect(frames.at(-1)).toBe(' '.repeat(34) + '=^@.@^=  ~');
	});
});
