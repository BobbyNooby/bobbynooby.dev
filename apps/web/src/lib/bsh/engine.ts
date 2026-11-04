import { ACH, type AchievementStore, type AchKey } from './achievements';
import { bar } from './format';
import { buildFs, pathOf, resolve, treeText } from './fs';
import { createMounts } from './mounts';
import type { BshData, DirNode, FileNode, FsNode, Line, PaneKey, ShellCtx, Win } from './types';

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

const SUDO_REPLIES = [
	'guest is not in the sudoers file. This incident will be reported to bobby.',
	'still no.',
	'bobby has been notified. he will do nothing about it.',
	'the cat has revoked your sudo privileges, permanently.'
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
const MAX_USERNAME = 24;

type Mode = { prompt: string; handle: (raw: string) => void };

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
	complete(value: string): string;
	unlock(key: AchKey): void;
	honk(): void;
	promptText(): string;
	readonly state: {
		cwd: string[];
		history: string[];
		user: string;
		mode: { prompt: string } | null;
	};
};

const isHidden = (n: FsNode) => n.type === 'dir' && !!n.hidden;

export function createShell(ctx: ShellCtx, opts: ShellOptions): Shell {
	const { store } = opts;
	const root = buildFs(
		createMounts(opts.data, {
			live: () => ctx.live(),
			now: opts.now ?? (() => new Date()),
			timeZone: opts.timeZone
		})
	);
	const st = {
		cwd: [] as string[],
		history: [] as string[],
		user: opts.user,
		mode: null as Mode | null,
		sudos: 0,
		exits: 0
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
	const focusFor = (node: FsNode) => {
		if (node.pane) ctx.focus(node.pane);
		if (node.gridCat) ctx.showCat(node.gridCat);
	};
	const openWindow = (w: Win) => {
		ctx.openWindow(w);
		unlock(w.kind === 'game' ? 'window' : 'media');
	};
	const lsLine = (node: DirNode, parts: string[], all: boolean) => {
		const names = Object.keys(node.kids).filter((n) => all || !isHidden(node.kids[n]));
		if (!names.length) return print('(empty)', '#9ca3af');
		const segs: Line = [];
		names.forEach((n, i) => {
			const abs = pathOf(parts.concat(n));
			segs.push(
				node.kids[n].type === 'dir'
					? { t: n + '/', c: '#60a5fa', run: 'cd ' + abs }
					: { t: n, c: '#f5f5f5', run: 'cat ' + abs }
			);
			if (i < names.length - 1) segs.push({ t: '  ' });
		});
		print(segs);
	};

	const honk = () => {
		const wasTrusted = store.trusted();
		const n = store.addHonk();
		print(n >= 25 ? 'HONK HONK HONK' : 'HONK!', '#facc15');
		ctx.honked(n);
		unlock('honk');
		if (!wasTrusted && store.trusted()) {
			print([
				{ t: 'the cat trusts you now. ', c: '#f472b6' },
				{ t: '.secrets/', c: '#60a5fa', run: 'ls ~/.secrets' },
				{ t: ' is open.', c: '#f472b6' }
			]);
			unlock('trusted');
		}
		if (n >= 25) unlock('addict');
	};
	const fakeRm = () =>
		RM_LINES.forEach(([t, color], i) => ctx.later(() => print(t, color), (i + 1) * 280));

	const run = (input: string) => {
		const raw = input.trim();
		print([
			{ t: promptText() + ' ', c: '#4ade80' },
			{ t: raw, c: '#f5f5f5' }
		]);
		if (st.mode) return st.mode.handle(raw);
		if (!raw) return;
		st.history.push(raw);
		const parts = raw.split(/\s+/);
		const c = parts[0].toLowerCase();
		const args = parts.slice(1);
		const arg = args.join(' ');

		if (c === 'clear') return ctx.clear();
		if (c === 'help') {
			print(
				'ls  cd  pwd  tree  cat  open  say  username  whoami  neofetch  honk  achievements  history  clear  man <cmd>'
			);
			return print('there are more commands than this. the cat knows.', '#6b6b6b');
		}
		if (c === 'man') {
			const row = COMMANDS.find((r) => r[0].split(/[\s·]+/).includes(args[0] || ''));
			return row
				? print([{ t: row[0], c: '#facc15' }, { t: '  ' + row[1] }])
				: print('man: no entry for ' + (args[0] || '?'), '#ef4444');
		}
		if (c === 'pwd') return print(pathOf(st.cwd));
		if (c === 'ls') {
			const all = args.includes('-a') || args.includes('-la');
			const target = args.filter((x) => !x.startsWith('-')).join(' ');
			const r = find(target);
			if (r.locked || locked(r.node)) {
				print('ls: permission denied. the cat does not trust you yet.', '#ef4444');
				return unlock('secret');
			}
			if (!r.node) return print('ls: no such file or folder: ' + target, '#ef4444');
			if (r.node.type === 'file') return print(target);
			return lsLine(r.node, r.parts, all);
		}
		if (c === 'cd') {
			const r = find(arg || '~');
			if (r.locked || locked(r.node)) {
				print('bsh: permission denied. the cat is watching.', '#ef4444');
				return unlock('secret');
			}
			if (!r.node) return print('cd: no such folder: ' + arg, '#ef4444');
			if (r.node.type !== 'dir') return print('cd: not a folder: ' + arg + ' (try cat)', '#ef4444');
			st.cwd = r.parts;
			ctx.onPrompt('cd');
			return focusFor(r.node);
		}
		if (c === 'tree') {
			const r = find(arg);
			if (!r.node || r.node.type !== 'dir' || locked(r.node)) {
				return print('tree: not a folder: ' + (arg || '.'), '#ef4444');
			}
			print(pathOf(r.parts), '#60a5fa');
			for (const t of treeText(r.node, store.trusted())) {
				print(t, t.trim().endsWith('/') ? '#60a5fa' : '#d1d5db');
			}
			return unlock('tree');
		}
		if (c === 'cat' || c === 'open') {
			if (!arg) return print(c + ': which file?', '#ef4444');
			const r = find(arg);
			if (r.locked) {
				print(c + ': permission denied. the cat does not trust you yet.', '#ef4444');
				return unlock('secret');
			}
			if (!r.node) return print(c + ': no such file: ' + arg, '#ef4444');
			if (r.node.type === 'dir')
				return print(c + ': ' + arg + ' is a folder (try ls or cd)', '#ef4444');
			const file: FileNode = r.node;
			if (c === 'cat') {
				for (const l of file.lines()) print(l);
				focusFor(file);
				if (file.win) openWindow(file.win);
				return;
			}
			if (file.win) {
				focusFor(file);
				return openWindow(file.win);
			}
			if (file.href) {
				print([{ t: 'opening ' }, { t: file.href, href: file.href }]);
				return ctx.openLink(file.href);
			}
			return print('open: nothing to open in ' + arg + ' (try cat)', '#9ca3af');
		}
		if (c === 'whoami') return print(st.user + ' (you)');
		if (c === 'history') {
			const start = Math.max(0, st.history.length - 12);
			st.history
				.slice(start)
				.forEach((x, i) => print('  ' + (start + i + 1) + '  ' + x, '#9ca3af'));
			return;
		}
		if (c === 'neofetch') {
			print(st.user.toLowerCase() + '@bobbynooby.dev', '#facc15');
			print('OS      bobbyOS (SvelteKit 2 + Svelte 5)');
			print('Host    bob - i7 12700k');
			print('Memory  8 GiB (32 GiB soon, trust)');
			return print('Shell   bsh 0.1 · Langs JS / TS / English');
		}
		if (c === 'honk') return honk();
		if (c === 'achievements' || c === 'ach') {
			const n = store.count();
			print(
				'achievements ' + n + '/' + ACH.length + '  [' + bar(n, ACH.length, 20) + ']',
				'#00ff00'
			);
			for (const a of ACH) {
				const got = store.has(a.key);
				const show = got || !a.hidden;
				print([
					{ t: got ? '[x] ' : '[ ] ', c: got ? '#00ff00' : '#6b6b6b' },
					{ t: show ? a.name : '???', c: got ? '#00ff00' : '#d1d5db' },
					{ t: '  ' + (show ? a.how : 'hidden. keep poking around.'), c: '#9ca3af' }
				]);
			}
			return;
		}
		if (c === '/username' || c === 'username') {
			if (!arg) {
				return print(
					'usage: username <name>   (the slash is only needed in the chat box)',
					'#ef4444'
				);
			}
			st.user = arg.slice(0, MAX_USERNAME);
			ctx.rename(st.user);
			print('Username changed to ' + st.user, '#FDE047');
			return unlock('rename');
		}
		if (c === 'say') {
			if (!arg) return print('say: what do you want to say?', '#ef4444');
			ctx.sendChat(st.user, arg);
			print('(sent to /Chat)', '#9ca3af');
			return unlock('say');
		}
		if (c === 'sudo') {
			st.sudos++;
			if (args[0] === 'honk') {
				print('(running honk as root. the one thing root can do.)', '#9ca3af');
				honk();
				return unlock('sudo');
			}
			if (args[0] === 'rm') {
				fakeRm();
				return unlock('sudo');
			}
			print(SUDO_REPLIES[Math.min(st.sudos, SUDO_REPLIES.length) - 1], '#ef4444');
			return unlock('sudo');
		}
		if (c === 'rm') return fakeRm();
		if (c === 'exit' || c === 'logout') {
			st.exits++;
			print(EXIT_REPLIES[Math.min(st.exits, EXIT_REPLIES.length) - 1], '#facc15');
			if (st.exits >= 3) unlock('exit');
			return;
		}
		if (/^((brew|make) )?coffee$/.test(raw.toLowerCase().replace(/\s+/g, ' '))) {
			return print("418 I'm a teapot. this shell only brews tea. (try honk)", '#facc15');
		}
		print('bsh: command not found: ' + c + '. try help', '#ef4444');
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
		if (matches.length === 1) return v.slice(0, v.length - tok.length) + base + shown(matches[0]);
		if (matches.length > 1) print(matches.map(shown).join('  '), '#9ca3af');
		return v;
	};

	return {
		run,
		complete,
		unlock,
		honk,
		promptText,
		get state() {
			return { cwd: st.cwd, history: st.history, user: st.user, mode: st.mode };
		}
	};
}
