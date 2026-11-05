import { PASS, type Command, type CommandTable, type ShellEnv } from './types';

const SUDO_REPLIES = [
	(user: string) =>
		user.toLowerCase() + ' is not in the sudoers file. This incident will be reported to bobby.',
	() => 'still no.',
	() => 'bobby has been notified. he will do nothing about it.',
	() => 'the cat has revoked your sudo privileges, permanently.'
];
const EXIT_REPLIES = [
	'there is no exit. only honk.',
	'seriously, your browser tab has a close button.',
	'logging out guest ... jk. you live here now.'
];
const RM_LINES: [string, string][] = [
	['removing ~/projects ...', '#ef4444'],
	['removing ~/links ...', '#ef4444'],
	['removing ~/3x3 ...', '#ef4444'],
	['removing the cat ...', '#ef4444'],
	['the cat refuses.', '#facc15'],
	['just kidding. everything is still here.', '#9ca3af']
];
const COFFEE = /^((brew|make) )?coffee$/;

const fakeRm = (env: ShellEnv) =>
	RM_LINES.forEach(([t, color], i) => env.ctx.later(() => env.print(t, color), (i + 1) * 280));

const sudo: Command = (env, { args }) => {
	env.st.sudos++;
	if (args[0] === 'honk') {
		env.print('(running honk as root. the one thing root can do.)', '#9ca3af');
		env.honk();
		return env.unlock('sudo');
	}
	if (args[0] === 'rm') {
		fakeRm(env);
		return env.unlock('sudo');
	}
	const reply = SUDO_REPLIES[Math.min(env.st.sudos, SUDO_REPLIES.length) - 1];
	env.print(reply(env.st.user), '#ef4444');
	return env.unlock('sudo');
};

const exit: Command = (env) => {
	env.st.exits++;
	env.print(EXIT_REPLIES[Math.min(env.st.exits, EXIT_REPLIES.length) - 1], '#facc15');
	if (env.st.exits >= 3) env.unlock('exit');
};

// "coffee", "brew coffee" and "make coffee" only; "make tea" is still not found.
const coffee: Command = (env, { raw }) => {
	if (!COFFEE.test(raw.toLowerCase().replace(/\s+/g, ' '))) return PASS;
	return env.print("418 I'm a teapot. this shell only brews tea. (try honk)", '#facc15');
};

export const jokeCommands: CommandTable = {
	sudo,
	rm: (env) => fakeRm(env),
	exit,
	logout: exit,
	coffee,
	brew: coffee,
	make: coffee
};
