import { ACH, type AchievementStore, type AchKey } from './achievements';
import { COMMAND_TABLE, PASS, type Call, type ShellEnv, type ShellState } from './commands';
import { honk } from './commands/people';
import { bar } from './format';
import { buildFs, isHidden, pathOf, resolve } from './fs';
import { createMounts } from './mounts';
import { cleanName } from './name';
import { mulberry32 } from './rng';
import type { BshData, FsNode, Line, PaneKey, ShellCtx, Win } from './types';

export const PANE_TITLES: Record<PaneKey, string> = {
	about: '/About_Me',
	projects: '/Projects',
	games: '/Games',
	chat: '/Chat',
	links: '/Links',
	status: '/Status',
	music: '/Music',
	grid: '/3x3',
	twitch: '/Twitch'
};

const QUIT_WORDS = new Set(['q', 'quit', 'exit']);

export type ShellOptions = {
	data: BshData;
	user: string;
	store: AchievementStore;
	seed?: number;
	timeZone?: string;
	now?: () => Date;
};

export type Shell = {
	run(raw: string): void;
	/** Ends a running game, if any, with a "left <game>." line. */
	leave(): void;
	complete(value: string): string;
	unlock(key: AchKey): void;
	honk(): void;
	promptText(): string;
	// A rename made outside the shell (the chat box), so both share one name.
	setUser(name: string): void;
	readonly state: {
		cwd: string[];
		history: string[];
		user: string;
		mode: { prompt: string } | null;
	};
};

// The shell: its state, the prompt, tab completion, and the helpers every
// command shares. The commands themselves live in ./commands.
export function createShell(ctx: ShellCtx, opts: ShellOptions): Shell {
	const { store } = opts;
	const root = buildFs(
		createMounts(opts.data, {
			live: () => ctx.live(),
			now: opts.now ?? (() => new Date()),
			timeZone: opts.timeZone
		})
	);
	const st: ShellState = {
		cwd: [],
		history: [],
		user: opts.user,
		mode: null,
		sudos: 0,
		exits: 0,
		pulls: 0
	};
	store.unlock('visit');

	const print = (segs: string | Line, color?: string) =>
		ctx.print(typeof segs === 'string' ? [{ t: segs, c: color }] : segs);
	const locked = (n: FsNode | null) => !!(n && n.type === 'dir' && n.locked && !store.trusted());
	const find = (path: string) => resolve(root, st.cwd, path, store.trusted());
	const promptText = () =>
		st.mode ? st.mode.prompt : st.user.toLowerCase() + '@bobbynooby.dev:' + pathOf(st.cwd) + '$';

	const unlock = (k: AchKey) => {
		const a = ACH.find((x) => x.key === k);
		if (!a || !store.unlock(k)) return;
		const n = store.count();
		print(
			'+ achievement: ' + a.name + '  [' + bar(n, ACH.length, 20) + '] ' + n + '/' + ACH.length,
			'#00ff00'
		);
		ctx.toast('+ ' + a.name + '  ' + n + '/' + ACH.length);
	};

	const env: ShellEnv = {
		ctx,
		data: opts.data,
		store,
		st,
		rng: mulberry32(opts.seed ?? Date.now() & 0x7fffffff),
		print,
		printAll: (lines) => lines.forEach((l) => ctx.print(l)),
		enterMode: (mode) => {
			st.mode = mode;
			ctx.onPrompt('mode');
		},
		endMode: () => {
			st.mode = null;
			ctx.onPrompt('mode');
		},
		find,
		locked,
		unlock,
		focusFor: (node) => {
			if (node.pane) ctx.focus(node.pane);
			if (node.gridCat) ctx.showCat(node.gridCat);
		},
		openWindow: (w: Win) => {
			ctx.openWindow(w);
			unlock(w.kind === 'game' ? 'window' : 'media');
		},
		honk: () => honk(env)
	};

	const leave = () => {
		if (!st.mode) return;
		print('left ' + st.mode.name + '.', '#9ca3af');
		env.endMode();
	};

	const run = (input: string) => {
		const raw = input.trim();
		print([
			{ t: promptText() + ' ', c: '#4ade80' },
			{ t: raw, c: '#f5f5f5' }
		]);
		if (st.mode) {
			if (QUIT_WORDS.has(raw.toLowerCase()) && !st.mode.ownsQuit) return leave();
			return st.mode.handle(raw);
		}
		if (!raw) return;
		st.history.push(raw);
		const parts = raw.split(/\s+/);
		const args = parts.slice(1);
		const call: Call = { name: parts[0].toLowerCase(), args, arg: args.join(' '), raw };
		const command = COMMAND_TABLE.get(call.name);
		if (command && command(env, call) !== PASS) return;
		print('bsh: command not found: ' + call.name + '. try help', '#ef4444');
	};

	const complete = (v: string) => {
		const tok = /(\S*)$/.exec(v)![1];
		const cut = tok.lastIndexOf('/') + 1;
		const base = tok.slice(0, cut);
		const partial = tok.slice(cut).toLowerCase();
		const r = find(base || '.');
		if (!r.node || r.node.type !== 'dir' || locked(r.node)) return v;
		const dir = r.node;
		const matches = Object.keys(dir.kids).filter(
			(n) =>
				n.toLowerCase().startsWith(partial) && (!isHidden(dir.kids[n]) || partial.startsWith('.'))
		);
		const shown = (n: string) => n + (dir.kids[n].type === 'dir' ? '/' : '');
		const head = v.slice(0, v.length - tok.length) + base;
		if (matches.length === 1) return head + shown(matches[0]);
		if (matches.length < 2) return v;
		print(matches.map(shown).join('  '), '#9ca3af');
		let shared = matches[0];
		for (const m of matches) while (!m.startsWith(shared)) shared = shared.slice(0, -1);
		return shared.length > partial.length ? head + shared : v;
	};

	return {
		run,
		leave,
		complete,
		unlock,
		honk: env.honk,
		promptText,
		setUser: (name: string) => {
			const clean = cleanName(name);
			if (clean) st.user = clean;
		},
		get state() {
			return { cwd: st.cwd, history: st.history, user: st.user, mode: st.mode };
		}
	};
}
