import { describe, expect, it } from 'vitest';
import { KONAMI, createTitleTaps, isNightOwl, konamiStep } from './eggs';

const feed = (keys: string[]) => keys.reduce((pos, k) => konamiStep(pos, k), 0);

describe('konamiStep', () => {
	it('completes on the full sequence, case-insensitively', () => {
		expect(
			feed([
				'ArrowUp',
				'ArrowUp',
				'ArrowDown',
				'ArrowDown',
				'ArrowLeft',
				'ArrowRight',
				'ArrowLeft',
				'ArrowRight',
				'B',
				'a'
			])
		).toBe(KONAMI.length);
	});

	it('resets on a wrong key', () => {
		expect(feed(['ArrowUp', 'ArrowUp', 'x'])).toBe(0);
	});

	it('survives extra ups at the start', () => {
		expect(feed(['ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowDown'])).toBe(3);
		expect(feed(['ArrowUp', 'ArrowDown', 'ArrowUp'])).toBe(1);
	});
});

describe('createTitleTaps', () => {
	it('fires on the 7th tap when each is within 1.5s of the last', () => {
		const taps = createTitleTaps();
		const fired = [0, 1000, 2000, 3000, 4000, 5000, 6000].map((t) => taps(t));
		expect(fired).toEqual([false, false, false, false, false, false, true]);
		expect(taps(6500)).toBe(false);
	});

	it('starts over after a pause', () => {
		const taps = createTitleTaps();
		[0, 100, 200, 300, 400, 500].forEach((t) => taps(t));
		expect(taps(2100)).toBe(false);
	});
});

describe('isNightOwl', () => {
	it('is true from 02:00 to 04:59 in London', () => {
		expect(isNightOwl(new Date('2026-11-05T02:00:00Z'))).toBe(true);
		expect(isNightOwl(new Date('2026-11-05T04:59:00Z'))).toBe(true);
		expect(isNightOwl(new Date('2026-11-05T05:00:00Z'))).toBe(false);
		expect(isNightOwl(new Date('2026-11-05T01:59:00Z'))).toBe(false);
	});

	it('follows British Summer Time', () => {
		expect(isNightOwl(new Date('2026-07-01T01:30:00Z'))).toBe(true);
		expect(isNightOwl(new Date('2026-07-01T04:30:00Z'))).toBe(false);
	});
});
