// Test helpers for the shell. Not imported by app code.
import { createAchievementStore, type StorageLike } from './achievements';
import { createShell, PANE_TITLES } from './engine';
import fixtureJson from './fixtures/site-data.json';
import { pathOf } from './fs';
import type { BshData, Line, PaneKey, ShellCtx } from './types';

export const fixture = fixtureJson as unknown as BshData;

export type RecordOptions = {
	pre?: string[];
	showCd?: boolean;
	runTab?: boolean;
	untilDone?: boolean;
};
export type GoldenCase = RecordOptions & { id: string; cmds: string[]; lines: Line[] };

export function memoryStorage(initial: Record<string, string> = {}): StorageLike {
	const data = new Map(Object.entries(initial));
	return {
		getItem: (key) => data.get(key) ?? null,
		setItem: (key, value) => void data.set(key, String(value))
	};
}

export function textOf(lines: Line[]): string {
	return lines.map((l) => l.map((s) => s.t).join('')).join('\n');
}

// A port of record() from docs/redesign/bobbyos-sheet.html: runs commands in a
// fresh shell and keeps the printed lines, plus "↳" lines for what the page would do.
function recorder(data: BshData, o: RecordOptions, storage: StorageLike) {
	let lines: Line[] = [];
	let pane: PaneKey = 'about';
	let gridCat = 'anime';
	const fx = (t: string) => lines.push([{ t: '↳ ' + t, fx: true }]);
	const ctx: ShellCtx = {
		print: (l) => lines.push(l),
		clear: () => {
			lines = [];
			fx('the screen clears');
		},
		focus: (p) => {
			if (p !== pane) {
				pane = p;
				fx('focuses ' + PANE_TITLES[p]);
			}
		},
		showCat: (c) => {
			if (c !== gridCat) {
				gridCat = c;
				fx('grid switches to ' + c);
			}
		},
		openWindow: (w) =>
			fx(
				'opens the ' +
					(w.kind === 'game' ? w.game.name : w.media.title || w.media.label) +
					' window'
			),
		openLink: (href) => fx('opens ' + href.replace(/^https?:\/\/(www\.)?/, '') + ' in a new tab'),
		sendChat: (user, msg) => fx('shows up in /Chat as <' + user + '> ' + msg),
		rename: () => {},
		toast: () => {},
		honked: () => {},
		onPrompt: (why) => {
			if (o.showCd && why === 'cd') fx('now in ' + pathOf(sh.state.cwd));
		},
		later: (fn) => fn(),
		animate: (frames) => lines.push([{ t: frames[frames.length - 1], c: '#facc15' }]),
		startSnake: () => {},
		live: () => ({
			discord: 'online',
			twitchLive: false,
			playing: data.lastPlayed ? data.lastPlayed.isPlaying : false
		})
	};
	const sh = createShell(ctx, {
		data,
		user: 'Guest_4821',
		store: createAchievementStore(storage),
		seed: 20261104,
		timeZone: 'UTC'
	});
	return {
		sh,
		fx,
		lines: () => lines,
		reset: () => {
			lines = [];
		}
	};
}

export function record(cmds: string[], o: RecordOptions = {}): Line[] {
	const r = recorder(fixture, o, memoryStorage());
	for (const c of o.pre ?? []) r.sh.run(c);
	r.reset();
	for (let i = 0; i < cmds.length; i++) {
		if (o.untilDone && i > 0 && !r.sh.state.mode) break;
		const c = cmds[i];
		if (c[0] === '\t') {
			const typed = c.slice(1);
			r.lines().push([
				{ t: r.sh.promptText() + ' ', c: '#4ade80' },
				{ t: typed, c: '#f5f5f5' },
				{ t: '   ⇥ Tab', fx: true }
			]);
			const before = r.lines().length;
			const done = r.sh.complete(typed);
			if (o.runTab) r.sh.run(done);
			else if (done !== typed) r.fx('completes to: ' + done);
			else if (r.lines().length === before) r.fx('no match, nothing happens');
		} else r.sh.run(c);
	}
	return r.lines();
}

export function runOn(data: BshData, cmds: string[], storage = memoryStorage()): Line[] {
	const r = recorder(data, {}, storage);
	for (const c of cmds) r.sh.run(c);
	return r.lines();
}
