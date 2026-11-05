import { describe, expect, it } from 'vitest';
import { HIDDEN_COMMANDS } from '../mounts';
import { record } from '../testing';
import { COMMAND_TABLE } from './index';
import { COMMANDS } from './meta';

describe('COMMAND_TABLE', () => {
	it('has a handler for every command man and help mention', () => {
		const named = COMMANDS.flatMap(([usage]) => usage.split(/[\s·]+/))
			.filter((word) => /^[a-z]+$/.test(word))
			.filter((word) => !['dir', 'file', 'msg', 'name', 'cmd'].includes(word));
		for (const name of named) expect(COMMAND_TABLE.has(name), name).toBe(true);
	});

	it('has a handler for every hidden game listed in .secrets/games.txt', () => {
		for (const line of HIDDEN_COMMANDS) {
			const name = line.split(' ')[0];
			expect(COMMAND_TABLE.has(name), name).toBe(true);
		}
	});

	it('does not treat object built-ins as commands', () => {
		for (const name of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) {
			const last = record([name]).at(-1)!;
			expect(last.map((s) => s.t).join('')).toBe(
				'bsh: command not found: ' + name.toLowerCase() + '. try help'
			);
		}
	});
});
