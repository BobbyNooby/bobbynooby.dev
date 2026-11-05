import { ACH, createAchievementStore, type AchievementStore } from '$lib/bsh/achievements';
import { createShell, type Shell } from '$lib/bsh/engine';
import { bar } from '$lib/bsh/format';
import { pathOf } from '$lib/bsh/fs';
import type { BshData, Line, ShellCtx, Win } from '$lib/bsh/types';
import { twitch } from '$lib/twitch/twitchLive.svelte';
import { staticFilesUrl } from '$lib/utils/externalURLs';
import { playAudio } from '$lib/utils/playAudio';
import type { OsContext } from './os.svelte';

export type ShellLine = { id: number; segs: Line };

const MAX_LINES = 200;

function storage(): Storage | null {
	try {
		return localStorage;
	} catch {
		return null;
	}
}

// The page side of bsh: the output buffer, the prompt and the ShellCtx the engine talks through.
export class ShellView {
	lines = $state.raw<ShellLine[]>([]);
	prompt = $state('guest@bobbynooby.dev:~$');
	title = $state('~');
	ready = $state(false);
	honks = $state(0);
	shell: Shell | null = null;
	store: AchievementStore;
	#next = 0;
	#os: OsContext;
	#hooks: { openWindow: (w: Win) => void; startSnake: () => void };

	constructor(os: OsContext, hooks: { openWindow: (w: Win) => void; startSnake: () => void }) {
		this.#os = os;
		this.#hooks = hooks;
		this.store = createAchievementStore(storage());
		this.honks = this.store.honks();
	}

	print(segs: Line): number {
		const id = this.#next++;
		this.lines = [...this.lines, { id, segs }].slice(-MAX_LINES);
		return id;
	}

	#replace(id: number, segs: Line) {
		this.lines = this.lines.map((l) => (l.id === id ? { id, segs } : l));
	}

	#sync() {
		if (!this.shell) return;
		this.prompt = this.shell.promptText();
		this.title = pathOf(this.shell.state.cwd);
	}

	start(data: BshData, user: string) {
		const { os, live, chat } = this.#os;
		const ctx: ShellCtx = {
			print: (line) => void this.print(line),
			clear: () => (this.lines = []),
			focus: (pane) => os.focus(pane),
			showCat: (category) => (os.gridCat = category),
			openWindow: (w) => this.#hooks.openWindow(w),
			openLink: (href) => window.open(href, '_blank', 'noopener,noreferrer'),
			sendChat: (name, msg) => chat.send(name, msg),
			rename: (name) => {
				chat.rename(name);
				this.#sync();
			},
			toast: (text) => os.toast(text),
			honked: (n) => {
				this.honks = n;
				playAudio(`${staticFilesUrl}/honk.mp3`);
			},
			onPrompt: () => this.#sync(),
			later: (fn, ms) => void setTimeout(fn, ms),
			animate: (frames, ms) => {
				const id = this.print([{ t: frames[0], c: '#facc15' }]);
				frames.slice(1).forEach((f, i) => {
					setTimeout(() => this.#replace(id, [{ t: f, c: '#facc15' }]), (i + 1) * ms);
				});
			},
			startSnake: () => this.#hooks.startSnake(),
			live: () => ({
				discord: live.discord === 'unknown' ? 'offline' : live.discord,
				twitchLive: !!twitch.status?.live,
				playing: live.song.isPlaying
			})
		};
		const firstVisit = !this.store.has('visit');
		this.shell = createShell(ctx, { data, user, store: this.store });
		this.print([
			{
				t: 'bsh 0.1 — welcome, ' + user.toLowerCase() + '. type ls to look around, or tap a name.',
				c: '#9ca3af'
			}
		]);
		if (firstVisit) {
			this.print([
				{
					t: '+ achievement: First Visit  [' + bar(1, ACH.length, 20) + '] 1/' + ACH.length,
					c: '#00ff00'
				}
			]);
		}
		for (const cmd of ['ls', 'cat about_me.txt', 'ls projects']) this.shell.run(cmd);
		this.#sync();
		this.ready = true;
	}

	run(cmd: string) {
		this.shell?.run(cmd);
		this.#sync();
	}

	honk() {
		this.shell?.honk();
	}

	unlock(key: Parameters<Shell['unlock']>[0]) {
		this.shell?.unlock(key);
	}
}
