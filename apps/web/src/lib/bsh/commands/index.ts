import { fileCommands } from './files';
import { gameCommands } from './games';
import { jokeCommands } from './jokes';
import { metaCommands } from './meta';
import { peopleCommands } from './people';
import type { Command, CommandTable } from './types';

const groups: CommandTable[] = [
	fileCommands,
	peopleCommands,
	metaCommands,
	jokeCommands,
	gameCommands
];

// A Map, so names like "constructor" never hit an object built-in.
export const COMMAND_TABLE = new Map<string, Command>();
for (const group of groups) {
	for (const [name, command] of Object.entries(group)) {
		if (COMMAND_TABLE.has(name)) throw new Error('bsh: command defined twice: ' + name);
		COMMAND_TABLE.set(name, command);
	}
}

export { PASS } from './types';
export type { Call, ShellEnv, ShellState } from './types';
