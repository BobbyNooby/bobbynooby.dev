import { describe, expect, it } from 'vitest';
import { record } from '../testing';

const out = (cmd: string) => record([cmd]).slice(1);

describe('man', () => {
	it('prints usage when given nothing', () => {
		expect(out('man')).toEqual([[{ t: 'usage: man <cmd>   (try man ls)', c: '#ef4444' }]]);
	});

	it('finds a command in any case', () => {
		expect(out('man LS')).toEqual(out('man ls'));
		expect(out('man Cat')).toEqual(out('man cat'));
	});
});
