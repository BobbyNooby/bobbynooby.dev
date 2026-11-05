import { describe, expect, it } from 'vitest';
import {
	PANE_KEYS,
	presenceClientMessageSchema,
	presenceCurSchema,
	presenceHelloSchema,
	presenceHideSchema
} from './presence';

const ID = '3f2b8c1e-7a4d-4e5f-9c0b-1a2b3c4d5e6f';

describe('presenceHelloSchema', () => {
	it('accepts a uuid id and a name', () => {
		expect(presenceHelloSchema.parse({ t: 'hello', id: ID, name: 'bob' })).toEqual({
			t: 'hello',
			id: ID,
			name: 'bob'
		});
	});

	it('trims the name before checking its length', () => {
		const name = `  ${'a'.repeat(24)}  `;
		expect(presenceHelloSchema.parse({ t: 'hello', id: ID, name }).name).toBe('a'.repeat(24));
	});

	it('strips invisible and direction-flipping characters from the name', () => {
		expect(presenceHelloSchema.parse({ t: 'hello', id: ID, name: '\u202ebob\u200b' }).name).toBe(
			'bob'
		);
	});

	it('accepts ids of 8 and 64 url-safe characters', () => {
		expect(presenceHelloSchema.safeParse({ t: 'hello', id: 'aB3_-xyz', name: 'b' }).success).toBe(
			true
		);
		expect(
			presenceHelloSchema.safeParse({ t: 'hello', id: 'a'.repeat(64), name: 'b' }).success
		).toBe(true);
	});

	it.each([
		['a short id', { t: 'hello', id: 'abc1234', name: 'bob' }],
		['a long id', { t: 'hello', id: 'a'.repeat(65), name: 'bob' }],
		['an id with other characters', { t: 'hello', id: 'abcd efgh', name: 'bob' }],
		['an id with markup', { t: 'hello', id: '<script>x', name: 'bob' }],
		['a non-string id', { t: 'hello', id: 12345678, name: 'bob' }],
		['an empty name', { t: 'hello', id: ID, name: '' }],
		['a whitespace name', { t: 'hello', id: ID, name: '   ' }],
		['an invisible-only name', { t: 'hello', id: ID, name: '\u200b\u3164\u2800' }],
		['a 25-character name', { t: 'hello', id: ID, name: 'a'.repeat(25) }],
		['a missing name', { t: 'hello', id: ID }]
	])('rejects %s', (_label, message) => {
		expect(presenceHelloSchema.safeParse(message).success).toBe(false);
	});
});

describe('presenceCurSchema', () => {
	it('accepts every pane key', () => {
		for (const pane of PANE_KEYS) {
			expect(presenceCurSchema.safeParse({ t: 'cur', pane, x: 0.5, y: 0.25 }).success).toBe(true);
		}
	});

	it('accepts finite numbers outside 0-1 so the registry can clamp them', () => {
		expect(presenceCurSchema.parse({ t: 'cur', pane: 'chat', x: -3, y: 42 })).toEqual({
			t: 'cur',
			pane: 'chat',
			x: -3,
			y: 42
		});
	});

	it.each([
		['an unknown pane', { t: 'cur', pane: 'shell', x: 0, y: 0 }],
		['a missing pane', { t: 'cur', x: 0, y: 0 }],
		['a string coordinate', { t: 'cur', pane: 'chat', x: '0.5', y: 0 }],
		['NaN', { t: 'cur', pane: 'chat', x: NaN, y: 0 }],
		['Infinity', { t: 'cur', pane: 'chat', x: 0, y: Infinity }],
		['a missing coordinate', { t: 'cur', pane: 'chat', x: 0 }]
	])('rejects %s', (_label, message) => {
		expect(presenceCurSchema.safeParse(message).success).toBe(false);
	});

	it('rejects the overflowing numbers JSON.parse turns into Infinity', () => {
		const message = JSON.parse('{"t":"cur","pane":"chat","x":1e999,"y":0}');
		expect(presenceCurSchema.safeParse(message).success).toBe(false);
	});
});

describe('presenceHideSchema', () => {
	it('accepts a hide message', () => {
		expect(presenceHideSchema.parse({ t: 'hide' })).toEqual({ t: 'hide' });
	});

	it('rejects another tag', () => {
		expect(presenceHideSchema.safeParse({ t: 'show' }).success).toBe(false);
	});
});

describe('presenceClientMessageSchema', () => {
	it('parses each message by its tag', () => {
		expect(presenceClientMessageSchema.parse({ t: 'hello', id: ID, name: 'bob' }).t).toBe('hello');
		expect(presenceClientMessageSchema.parse({ t: 'cur', pane: 'about', x: 0, y: 1 }).t).toBe(
			'cur'
		);
		expect(presenceClientMessageSchema.parse({ t: 'hide' }).t).toBe('hide');
	});

	it('drops fields it does not know', () => {
		expect(presenceClientMessageSchema.parse({ t: 'hide', ip: '1.2.3.4' })).toEqual({ t: 'hide' });
	});

	it.each([
		['an unknown tag', { t: 'state', here: 1, cursors: [] }],
		['a missing tag', { id: ID, name: 'bob' }],
		['a non-object', 'hello'],
		['null', null],
		['a cur with a hello shape', { t: 'cur', id: ID, name: 'bob' }]
	])('rejects %s', (_label, message) => {
		expect(presenceClientMessageSchema.safeParse(message).success).toBe(false);
	});
});
