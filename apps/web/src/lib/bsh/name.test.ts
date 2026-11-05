import { describe, expect, it } from 'vitest';
import { cleanName, MAX_NAME } from './name';

describe('cleanName', () => {
	it('keeps a plain name, trimmed', () => {
		expect(cleanName('  bob  ')).toBe('bob');
		expect(cleanName('Guest_4821')).toBe('Guest_4821');
	});

	it('cuts at 24 without splitting a character', () => {
		expect(MAX_NAME).toBe(24);
		expect(cleanName('n'.repeat(40))).toBe('n'.repeat(24));
		expect(cleanName('a'.repeat(23) + '😀')).toBe('a'.repeat(23));
		expect(cleanName('😀'.repeat(20))).toBe('😀'.repeat(12));
		const family = '👨\u200D👩\u200D👧';
		expect(cleanName(family.repeat(4))).toBe(family.repeat(3));
	});

	it('drops bidi and zero-width controls', () => {
		expect(cleanName('\u202Ebob')).toBe('bob');
		expect(cleanName('b\u200Bo\u2066b\u2069')).toBe('bob');
	});

	it('refuses a name with nothing visible in it', () => {
		for (const name of [
			'',
			'   ',
			'\u200B',
			'\u3164',
			'\u115F\u1160',
			'\u202E\u202D',
			'\uFEFF',
			' \u2800 ',
			'\uFFA0',
			'\u200D'
		]) {
			expect(cleanName(name), JSON.stringify(name)).toBe('');
		}
	});
});
