import { describe, expect, it } from 'vitest';
import { record, textOf } from '../testing';

describe('sudo', () => {
	it('names the current user in the sudoers joke', () => {
		expect(textOf(record(['sudo ls']))).toContain(
			'guest_4821 is not in the sudoers file. This incident will be reported to bobby.'
		);
		expect(textOf(record(['username Neo', 'sudo ls']))).toContain(
			'\nneo is not in the sudoers file.'
		);
	});
});
