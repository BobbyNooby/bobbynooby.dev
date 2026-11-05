import { describe, expect, it } from 'vitest';
import { fromTen, toTen } from './score';

describe('score', () => {
	it('shows the stored 0-1 score out of 10', () => {
		expect(toTen(0.9)).toBe('9.0');
		expect(toTen(0.7)).toBe('7.0');
		expect(toTen(1)).toBe('10.0');
		expect(toTen(6.9)).toBe('69.0');
	});

	it('stores a /10 score back as 0-1 without float noise', () => {
		expect(fromTen('8.5')).toBe(0.85);
		expect(fromTen('7')).toBe(0.7);
		expect(fromTen('9.3')).toBe(0.93);
	});

	it('turns blank or junk input into NaN so the row gets flagged', () => {
		expect(fromTen('')).toBeNaN();
		expect(fromTen('  ')).toBeNaN();
		expect(fromTen('abc')).toBeNaN();
	});
});
