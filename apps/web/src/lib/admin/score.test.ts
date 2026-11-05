import { describe, expect, it } from 'vitest';
import { fromTen, toTen } from './score';

describe('score', () => {
	it('shows the stored 0-1 score out of 10', () => {
		expect(toTen(0.9)).toBe('9.0');
		expect(toTen(0.7)).toBe('7.0');
		expect(toTen(1)).toBe('10.0');
		expect(toTen(6.9)).toBe('69.0');
	});

	it('shows one decimal without float noise', () => {
		expect(toTen(0.57)).toBe('5.7');
		expect(toTen(0.85)).toBe('8.5');
	});

	it('stores a /10 score back as 0-1 without float noise', () => {
		expect(fromTen('8.5')).toBe(0.85);
		expect(fromTen('7')).toBe(0.7);
		expect(fromTen('9.3')).toBe(0.93);
		expect(fromTen('10')).toBe(1);
		expect(fromTen('0')).toBe(0);
		expect(fromTen('8.')).toBe(0.8);
	});

	it('turns blank or junk input into NaN so the row gets flagged', () => {
		for (const text of ['', '  ', 'abc', '-1', '+1', '0x10', '1e1', 'Infinity', '7,5', '1.2.3']) {
			expect(fromTen(text)).toBeNaN();
		}
	});
});
