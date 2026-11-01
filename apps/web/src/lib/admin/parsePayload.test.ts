import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { parsePayload } from './parsePayload';

const schema = z.array(z.object({ uid: z.number() }));

describe('parsePayload', () => {
	it('parses a valid list', () => {
		expect(parsePayload(schema, '[{"uid":1}]', 'links')).toEqual([{ uid: 1 }]);
	});

	it('accepts an explicit empty list', () => {
		expect(parsePayload(schema, '[]', 'links')).toEqual([]);
	});

	it('rejects a missing or blank field instead of treating it as empty', () => {
		expect(() => parsePayload(schema, null, 'links')).toThrow('Missing links');
		expect(() => parsePayload(schema, '', 'links')).toThrow('Missing links');
	});

	it('rejects malformed JSON and schema mismatches', () => {
		expect(() => parsePayload(schema, '{', 'links')).toThrow('Malformed JSON in links');
		expect(() => parsePayload(schema, '[{"uid":"x"}]', 'links')).toThrow('Invalid links');
	});
});
