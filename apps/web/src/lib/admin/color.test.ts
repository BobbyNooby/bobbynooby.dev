import { describe, expect, it } from 'vitest';
import { swatchValue } from './color';

describe('swatchValue', () => {
	it('passes six-digit hex through', () => {
		expect(swatchValue('#FF0000')).toBe('#FF0000');
	});

	it('expands three-digit hex', () => {
		expect(swatchValue('#f0a')).toBe('#ff00aa');
	});

	it('drops the alpha from eight-digit hex', () => {
		expect(swatchValue('#11223380')).toBe('#112233');
	});

	it('falls back to white for colour names and junk', () => {
		expect(swatchValue('red')).toBe('#ffffff');
		expect(swatchValue('')).toBe('#ffffff');
	});
});
