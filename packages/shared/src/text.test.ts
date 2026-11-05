import { describe, expect, it } from 'vitest';
import { cleanText, isReservedName } from './text';
import { chatIntakeSchema } from './index';

describe('cleanText', () => {
	it('trims and keeps ordinary text', () => {
		expect(cleanText('  hello there  ')).toBe('hello there');
	});

	it.each([
		['a zero-width space', '\u200b'],
		['a zero-width non-joiner', '\u200c'],
		['a stray zero-width joiner', '\u200d'],
		['a left-to-right mark', '\u200e'],
		['a right-to-left mark', '\u200f'],
		['a right-to-left override', '\u202e'],
		['a left-to-right embedding', '\u202a'],
		['a word joiner', '\u2060'],
		['a bidi isolate', '\u2067'],
		['a byte order mark', '\ufeff'],
		['a Hangul filler', '\u3164'],
		['a Hangul choseong filler', '\u115f'],
		['a Hangul jungseong filler', '\u1160'],
		['a halfwidth Hangul filler', '\uffa0'],
		['a soft hyphen', '\u00ad'],
		['a braille blank', '\u2800']
	])('strips %s', (_label, ch) => {
		expect(cleanText(`a${ch}b`)).toBe('ab');
	});

	it('leaves nothing of invisible-only text', () => {
		expect(cleanText(' \u200b\u3164\u202e\ufeff\u2800 ')).toBe('');
	});

	it('trims spaces left behind by stripped characters', () => {
		expect(cleanText('\u200b hi \u200b')).toBe('hi');
	});

	it('keeps the joiner that builds one emoji out of several', () => {
		for (const emoji of [
			'👨\u200d👩\u200d👧',
			'🏳\ufe0f\u200d🌈',
			'👩🏽\u200d💻',
			'❤\ufe0f\u200d🔥'
		]) {
			expect(cleanText(emoji)).toBe(emoji);
		}
	});
});

describe('isReservedName', () => {
	it.each([
		'BobbyNooby',
		'bobbynooby',
		'BOBBYNOOBY',
		'Bobby Nooby',
		'  bobbynooby.dev  ',
		'bobbynooby . dev',
		'Bobby_Nooby',
		'**BobbyNooby**',
		'👑BobbyNooby',
		'BóbbyNooby',
		'Bobby\u200bNooby',
		'Bobby\u3164Nooby',
		'\u202eBobbyNooby',
		'ＢｏｂｂｙＮｏｏｂｙ'
	])('reserves %j', (name) => {
		expect(isReservedName(name)).toBe(true);
	});

	it.each(['Bobby', 'BobbyNoobyFan', 'NotBobbyNooby', 'Guest_1234', 'bobbynooby.de', 'bsh'])(
		'allows %j',
		(name) => {
			expect(isReservedName(name)).toBe(false);
		}
	);
});

describe('chatIntakeSchema', () => {
	it('cleans the name and the message', () => {
		expect(chatIntakeSchema.parse({ name: ' bob\u200b ', message: ' hi\u202e there ' })).toEqual({
			name: 'bob',
			message: 'hi there'
		});
	});

	it.each([
		['an invisible-only name', { name: '\u3164', message: 'hi' }],
		['a zero-width name', { name: '\u200b\u200b', message: 'hi' }],
		['an invisible-only message', { name: 'bob', message: '\u200b' }],
		['a whitespace message', { name: 'bob', message: '   ' }],
		['a 51-character name', { name: 'a'.repeat(51), message: 'hi' }],
		['a 1901-character message', { name: 'bob', message: 'a'.repeat(1901) }]
	])('rejects %s', (_label, value) => {
		expect(chatIntakeSchema.safeParse(value).success).toBe(false);
	});

	it('checks length after cleaning', () => {
		const message = `${'a'.repeat(1900)}\u200b\u200b`;
		expect(chatIntakeSchema.parse({ name: 'bob', message }).message).toBe('a'.repeat(1900));
	});
});
