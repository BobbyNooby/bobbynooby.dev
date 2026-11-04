import { describe, expect, it } from 'vitest';
import { ago, bar, fmtHours, playedDate, safeHref } from './format';

describe('format', () => {
	it('formats hours and bars', () => {
		expect(fmtHours(1964)).toBe('1,964h');
		expect(bar(35, 42, 18)).toBe('███████████████░░░');
		expect(bar(2, 20, 20)).toBe('██' + '░'.repeat(18));
	});

	it('formats relative and absolute dates', () => {
		const now = new Date('2026-11-04T12:00:00Z');
		expect(ago('2026-11-04T11:59:30Z', now)).toBe('just now');
		expect(ago('2026-11-04T09:00:00Z', now)).toBe('3h ago');
		expect(ago('not a date', now)).toBe('');
		expect(playedDate(Date.UTC(2026, 5, 11) / 1000, 'UTC')).toBe('Jun 11, 2026');
	});

	it('only lets http(s) hrefs through', () => {
		expect(safeHref('https://github.com/x')).toBe('https://github.com/x');
		expect(safeHref('javascript:alert(1)')).toBeUndefined();
		expect(safeHref('data:text/html,hi')).toBeUndefined();
		expect(safeHref('/relative')).toBeUndefined();
		expect(safeHref(null)).toBeUndefined();
	});
});
