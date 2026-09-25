import { describe, expect, it } from 'vitest';
import { pickForwardedIp } from './forwardedIp';

describe('pickForwardedIp', () => {
	it('takes the last entry, ignoring spoofed leading ones', () => {
		expect(pickForwardedIp('1.2.3.4, 5.6.7.8, 203.0.113.7', '10.0.0.1')).toBe('203.0.113.7');
	});

	it('returns the fallback for a missing or blank header', () => {
		expect(pickForwardedIp(null, '10.0.0.1')).toBe('10.0.0.1');
		expect(pickForwardedIp(undefined, '10.0.0.1')).toBe('10.0.0.1');
		expect(pickForwardedIp('', '10.0.0.1')).toBe('10.0.0.1');
		expect(pickForwardedIp('   ', '10.0.0.1')).toBe('10.0.0.1');
	});

	it('trims a single entry', () => {
		expect(pickForwardedIp('  203.0.113.7  ', '10.0.0.1')).toBe('203.0.113.7');
	});
});
