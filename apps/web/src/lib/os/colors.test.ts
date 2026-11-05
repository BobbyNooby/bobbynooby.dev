import { describe, expect, it } from 'vitest';
import { inkFor } from './colors';

describe('inkFor', () => {
	it('picks dark ink on light colours and light ink on dark ones', () => {
		expect(inkFor('#ffd6ae')).toBe('#111111');
		expect(inkFor('#43a1f1')).toBe('#ffffff');
		expect(inkFor('d61a35')).toBe('#ffffff');
	});

	it('falls back for missing or odd values', () => {
		expect(inkFor(null)).toBe('#f5f5f5');
		expect(inkFor('red')).toBe('#f5f5f5');
	});
});
