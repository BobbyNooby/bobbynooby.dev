import { describe, expect, it } from 'vitest';
import { createTokenBucket } from './tokenBucket';

describe('createTokenBucket', () => {
	it('allows up to capacity then denies', () => {
		const bucket = createTokenBucket({ capacity: 3, refillPerSecond: 0, now: () => 0 });
		expect(bucket.tryTake()).toBe(true);
		expect(bucket.tryTake()).toBe(true);
		expect(bucket.tryTake()).toBe(true);
		expect(bucket.tryTake()).toBe(false);
	});

	it('refills over time and is capped at capacity', () => {
		let t = 0;
		const bucket = createTokenBucket({ capacity: 2, refillPerSecond: 1, now: () => t });
		bucket.tryTake();
		bucket.tryTake();
		expect(bucket.tryTake()).toBe(false);
		t = 4000; // 4s -> +4 tokens, capped at 2
		expect(bucket.tryTake()).toBe(true);
		expect(bucket.tryTake()).toBe(true);
		expect(bucket.tryTake()).toBe(false);
	});
});
