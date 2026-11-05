import { ACH } from '../achievements';
import { bar } from '../format';
import type { Command, CommandTable } from './types';

// [usage, description] for man. Hidden games are deliberately not here.
export const COMMANDS: readonly [string, string][] = [
	['ls [-a] [dir]', 'List a folder. Folder and file names in the output are tappable.'],
	['cd <dir>', 'Move into a folder and focus its pane. cd .. and cd ~ work too.'],
	['pwd', 'Print where you are.'],
	['tree [dir]', 'Print the folder tree.'],
	['cat <file>', 'Print a file with its link. Games and 3x3 entries also open their window.'],
	['open <file>', 'Open a link file in a new tab, or a game or 3x3 window.'],
	['say <msg>', 'Post to /Chat through the chat socket.'],
	['username <name>', 'Rename yourself. No slash needed here; the chat box still wants /username.'],
	['whoami · neofetch · honk', 'Who you are, the host card, and the honk.'],
	['history · clear', 'List what you typed, or clear the screen.'],
	['help · man <cmd>', 'List the commands, or explain one.'],
	['achievements', 'List every achievement. Hidden ones show as ??? until found.'],
	[
		'sudo · rm · exit',
		'Jokes. Nothing happens except achievements. The hidden games are not listed here.'
	],
	['Tab · ↑ ↓', 'Complete a path, or walk your history (keyboard).']
];

const help: Command = (env) => {
	env.print(
		'ls  cd  pwd  tree  cat  open  say  username  whoami  neofetch  honk  achievements  history  clear  man <cmd>'
	);
	return env.print('there are more commands than this. the cat knows.', '#6b6b6b');
};

const man: Command = (env, { args }) => {
	if (!args[0]) return env.print('usage: man <cmd>   (try man ls)', '#ef4444');
	const name = args[0].toLowerCase();
	const row = COMMANDS.find((r) =>
		r[0]
			.toLowerCase()
			.split(/[\s·]+/)
			.includes(name)
	);
	return row
		? env.print([{ t: row[0], c: '#facc15' }, { t: '  ' + row[1] }])
		: env.print('man: no entry for ' + args[0], '#ef4444');
};

const history: Command = (env) => {
	const start = Math.max(0, env.st.history.length - 12);
	env.st.history
		.slice(start)
		.forEach((x, i) => env.print('  ' + (start + i + 1) + '  ' + x, '#9ca3af'));
};

const achievements: Command = (env) => {
	const n = env.store.count();
	env.print(
		'achievements ' + n + '/' + ACH.length + '  [' + bar(n, ACH.length, 20) + ']',
		'#00ff00'
	);
	for (const a of ACH) {
		const got = env.store.has(a.key);
		const show = got || !a.hidden;
		env.print([
			{ t: got ? '[x] ' : '[ ] ', c: got ? '#00ff00' : '#6b6b6b' },
			{ t: show ? a.name : '???', c: got ? '#00ff00' : '#d1d5db' },
			{ t: '  ' + (show ? a.how : 'hidden. keep poking around.'), c: '#9ca3af' }
		]);
	}
};

export const metaCommands: CommandTable = {
	clear: (env) => env.ctx.clear(),
	help,
	man,
	history,
	achievements,
	ach: achievements
};
