import { CHAT_MAX_MESSAGE_LENGTH, chatIntakeSchema } from '@bobbynooby/shared';
import type { ChatSendResult } from '../types';
import type { Command, CommandTable, ShellEnv } from './types';

export const MAX_USERNAME = 24;

const SAY_FAILED: Record<Exclude<ChatSendResult, 'sent'>, string> = {
	offline: 'say: /Chat is reconnecting. try again in a moment.',
	'too-fast': 'say: slow down. /Chat takes 5 messages, then one every 2 seconds.',
	invalid: 'say: that message cannot be sent.'
};

/** The honk, shared by the command, sudo honk and the cat logo. 10 opens .secrets/. */
export function honk(env: ShellEnv) {
	const wasTrusted = env.store.trusted();
	const n = env.store.addHonk();
	env.print(n >= 25 ? 'HONK HONK HONK' : 'HONK!', '#facc15');
	env.ctx.honked(n);
	env.unlock('honk');
	if (!wasTrusted && env.store.trusted()) {
		env.print([
			{ t: 'the cat trusts you now. ', c: '#f472b6' },
			{ t: '.secrets/', c: '#60a5fa', run: 'ls ~/.secrets' },
			{ t: ' is open.', c: '#f472b6' }
		]);
		env.unlock('trusted');
	}
	if (n >= 25) env.unlock('addict');
}

const username: Command = (env, { arg }) => {
	if (!arg) {
		return env.print(
			'usage: username <name>   (the slash is only needed in the chat box)',
			'#ef4444'
		);
	}
	env.st.user = arg.slice(0, MAX_USERNAME);
	env.ctx.rename(env.st.user);
	env.print('Username changed to ' + env.st.user, '#FDE047');
	return env.unlock('rename');
};

const say: Command = (env, { arg }) => {
	if (!arg) return env.print('say: what do you want to say?', '#ef4444');
	// Same schema the backend enforces, so the shell never claims a message
	// was sent when the server would drop it.
	const check = chatIntakeSchema.safeParse({ name: env.st.user, message: arg });
	if (!check.success) {
		return env.print(
			check.error.issues.some((i) => i.path[0] === 'message')
				? 'say: messages can be at most ' + CHAT_MAX_MESSAGE_LENGTH + ' characters'
				: 'say: your name does not fit in /Chat. try username <name>',
			'#ef4444'
		);
	}
	const result = env.ctx.sendChat(env.st.user, arg);
	if (result !== 'sent') return env.print(SAY_FAILED[result], '#ef4444');
	env.print('(sent to /Chat)', '#9ca3af');
	return env.unlock('say');
};

const neofetch: Command = (env) => {
	env.print(env.st.user.toLowerCase() + '@bobbynooby.dev', '#facc15');
	env.print('OS      bobbyOS (SvelteKit 2 + Svelte 5)');
	env.print('Host    bob - i7 12700k');
	env.print('Memory  8 GiB (32 GiB soon, trust)');
	return env.print('Shell   bsh 0.1 · Langs JS / TS / English');
};

export const peopleCommands: CommandTable = {
	whoami: (env) => env.print(env.st.user + ' (you)'),
	username,
	'/username': username,
	say,
	neofetch,
	honk: (env) => env.honk()
};
