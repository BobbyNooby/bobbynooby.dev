import { describe, expect, it } from 'vitest';
import { isValidURL } from '$lib/shortURL/isValidURL';

describe('isValidURL', () => {
	it('accepts plain https URLs', () => {
		expect(isValidURL('example.com')).toBe(true);
		expect(isValidURL('https://example.com/path?q=1')).toBe(true);
	});
	it('rejects scheme injection and hostless input', () => {
		expect(isValidURL('javascript:alert(1)')).toBe(false);
		expect(isValidURL('data:text/html,hi')).toBe(false);
		expect(isValidURL('not a url')).toBe(false);
	});
});
