import { describe, expect, it } from 'vitest';
import { record, textOf } from '../testing';

describe('say', () => {
	it('confirms a message the chat socket took', () => {
		const out = textOf(record(['say hi']));
		expect(out).toContain('(sent to /Chat)');
		expect(out).toContain('Said Something');
	});

	it('says so when /Chat is offline, and does not count it', () => {
		const out = textOf(record(['say hi'], { chat: 'offline' }));
		expect(out).toContain('say: /Chat is reconnecting. try again in a moment.');
		expect(out).not.toContain('(sent to /Chat)');
		expect(out).not.toContain('Said Something');
	});

	it('keeps the spacing of the message', () => {
		const out = textOf(record(['say   hello    there  :  )']));
		expect(out).toContain('shows up in /Chat as <Guest_4821> hello    there  :  )');
	});

	it('says so when sending too fast', () => {
		const out = textOf(record(['say hi'], { chat: 'too-fast' }));
		expect(out).toContain('say: slow down. /Chat takes 5 messages, then one every 2 seconds.');
		expect(out).not.toContain('(sent to /Chat)');
	});
});

describe('username', () => {
	it('cuts a long name without splitting an emoji', () => {
		const out = textOf(record(['username ' + 'a'.repeat(23) + '😀', 'whoami']));
		expect(out).toContain('Username changed to ' + 'a'.repeat(23) + '\n');
		expect(out).toContain('\n' + 'a'.repeat(23) + ' (you)');
	});

	it('refuses a name with nothing visible in it', () => {
		const out = textOf(record(['username \u3164\u200B', 'whoami']));
		expect(out).toContain('username: that name has nothing visible in it');
		expect(out).not.toContain('Username changed');
		expect(out).toContain('Guest_4821 (you)');
	});
});
