import { describe, expect, it } from 'vitest';
import { createConnectionLimiter } from './connectionLimiter';

describe('createConnectionLimiter', () => {
	it('denies a key at its limit without affecting other keys', () => {
		const limiter = createConnectionLimiter(2);
		expect(limiter.tryAcquire('a')).toBe(true);
		expect(limiter.tryAcquire('a')).toBe(true);
		expect(limiter.tryAcquire('a')).toBe(false);
		expect(limiter.tryAcquire('b')).toBe(true);
	});

	it('frees a slot on release', () => {
		const limiter = createConnectionLimiter(1);
		expect(limiter.tryAcquire('a')).toBe(true);
		limiter.release('a');
		expect(limiter.tryAcquire('a')).toBe(true);
	});

	it('forgets a key once its count reaches zero', () => {
		const limiter = createConnectionLimiter(1);
		limiter.tryAcquire('a');
		limiter.release('a');
		limiter.release('a');
		expect(limiter.size()).toBe(0);
	});
});
