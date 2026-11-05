import { ACH, createAchievementStore, type AchievementStore } from '$lib/bsh/achievements';
import { createShell, type Shell } from '$lib/bsh/engine';
import { bar } from '$lib/bsh/format';
import { pathOf } from '$lib/bsh/fs';
import type { Point } from '$lib/bsh/games/snake';
import { mulberry32 } from '$lib/bsh/rng';
import type { BshData, Line, ShellCtx, Win } from '$lib/bsh/types';
import { twitch } from '$lib/twitch/twitchLive.svelte';
import { staticFilesUrl } from '$lib/utils/externalURLs';
import { playAudio } from '$lib/utils/playAudio';
import { isNightOwl } from './eggs';
import type { OsContext } from './os.svelte';
import { SnakeGame } from './snake';

export type ShellLine = { id: number; segs: Line; kind?: 'snake' | 'pad' };

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
	#hooks: { openWindow: (w: Win) => void };
	#snake: SnakeGame | null = null;
	#rng = mulberry32((Math.random() * 2 ** 32) >>> 0);

	constructor(os: OsContext, hooks: { openWindow: (w: Win) => void }) {
		this.#os = os;
		this.#hooks = hooks;
		this.store = createAchievementStore(storage());
		this.honks = this.store.honks();
	}

	print(segs: Line, kind?: ShellLine['kind']): number {
		const id = this.#next++;
		this.lines = [...this.lines, { id, segs, kind }].slice(-MAX_LINES);
		return id;
	}

	#replace(id: number, segs: Line) {
		this.lines = this.lines.map((l) => (l.id === id ? { ...l, segs } : l));
	}

	// Snake runs in the page: the engine only says "start", the game lives in ./snake.
	#startSnake() {
		this.#snake?.stop('restart');
		this.#snake = new SnakeGame(
			{
				print: (segs, kind) => this.print(segs, kind),
				replace: (id, segs) => this.#replace(id, segs),
				remove: (id) => (this.lines = this.lines.filter((l) => l.id !== id))
			},
			this.#rng,
			(why, score) => {
				this.#snake = null;
				if (why !== 'restart' && score >= 10) this.unlock('snake');
			}
		);
	}

	get snaking() {
		return this.#snake !== null;
	}

	snakeTurn(dir: Point) {
		this.#snake?.turn(dir);
	}

	snakeQuit() {
		this.#snake?.stop('quit');
	}

	// Arrow keys/WASD steer and q or Esc quits while a game is on; returns true when used.
	snakeKey(event: KeyboardEvent): boolean {
		return this.#snake?.key(event) ?? false;
	}

	/** Stops a running snake game, so its timer does not outlive the page. */
	destroy() {
		this.#snake?.stop('restart');
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
			clear: () => {
				this.#snake?.stop('restart');
				this.lines = [];
			},
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
			startSnake: () => this.#startSnake(),
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
		if (isNightOwl(new Date())) {
			this.print([{ t: "it's past 2am in London. bobby is probably still up too.", c: '#9ca3af' }]);
			this.shell.unlock('owl');
		}
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

	setUser(name: string) {
		if (!this.shell || this.shell.state.user === name) return;
		this.shell.setUser(name);
		this.#sync();
	}

	unlock(key: Parameters<Shell['unlock']>[0]) {
		this.shell?.unlock(key);
	}
}
