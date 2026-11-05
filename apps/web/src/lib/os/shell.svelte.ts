import { ACH, createAchievementStore, type AchievementStore } from '$lib/bsh/achievements';
import { createShell, type Shell } from '$lib/bsh/engine';
import { bar } from '$lib/bsh/format';
import { pathOf } from '$lib/bsh/fs';
import {
	createSnake,
	snakeBoard,
	stepSnake,
	turnSnake,
	type Point,
	type SnakeState
} from '$lib/bsh/games/snake';
import { mulberry32 } from '$lib/bsh/rng';
import type { BshData, Line, ShellCtx, Win } from '$lib/bsh/types';
import { twitch } from '$lib/twitch/twitchLive.svelte';
import { staticFilesUrl } from '$lib/utils/externalURLs';
import { playAudio } from '$lib/utils/playAudio';
import { isNightOwl } from './eggs';
import type { OsContext } from './os.svelte';

export type ShellLine = { id: number; segs: Line; kind?: 'snake' | 'pad' };

const SNAKE_TICK_MS = 140;
const SNAKE_KEYS: Record<string, Point> = {
	arrowup: [0, -1],
	w: [0, -1],
	arrowdown: [0, 1],
	s: [0, 1],
	arrowleft: [-1, 0],
	a: [-1, 0],
	arrowright: [1, 0],
	d: [1, 0]
};

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
	#snake: {
		state: SnakeState;
		board: number;
		info: number;
		pad: number;
		timer?: ReturnType<typeof setInterval>;
	} | null = null;
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

	// Snake runs in the page: the engine only says "start", the board lives in the output.
	#startSnake() {
		this.#stopSnake('restart');
		const state = createSnake(this.#rng);
		const board = this.print([{ t: snakeBoard(state) }], 'snake');
		const info = this.print([{ t: '', c: '#9ca3af' }]);
		const pad = this.print([], 'pad');
		this.#snake = { state, board, info, pad };
		this.#drawSnake();
	}

	#drawSnake() {
		const g = this.#snake;
		if (!g) return;
		this.#replace(g.board, [{ t: snakeBoard(g.state) }]);
		this.#replace(g.info, [
			{
				t:
					'score ' +
					g.state.score +
					(g.state.started ? '' : ' · press a direction to start') +
					' · q quits',
				c: '#9ca3af'
			}
		]);
	}

	#stopSnake(why: 'crash' | 'quit' | 'restart') {
		const g = this.#snake;
		if (!g) return;
		clearInterval(g.timer);
		this.#snake = null;
		this.lines = this.lines.filter((l) => l.id !== g.pad);
		if (why === 'restart') return;
		const score = g.state.score;
		this.print([
			{
				t:
					(why === 'crash' ? 'game over. ' : 'quit. ') +
					'score ' +
					score +
					(score >= 10 ? '' : '   (10 unlocks something)'),
				c: why === 'crash' ? '#ef4444' : '#9ca3af'
			}
		]);
		if (score >= 10) this.unlock('snake');
	}

	get snaking() {
		return this.#snake !== null;
	}

	snakeTurn(dir: Point) {
		const g = this.#snake;
		if (!g) return;
		const wasStarted = g.state.started;
		g.state = turnSnake(g.state, dir);
		if (!wasStarted && g.state.started) {
			g.timer = setInterval(() => {
				if (!this.#snake) return;
				this.#snake.state = stepSnake(this.#snake.state, this.#rng);
				if (this.#snake.state.over) this.#stopSnake('crash');
				else this.#drawSnake();
			}, SNAKE_TICK_MS);
		}
		this.#drawSnake();
	}

	snakeQuit() {
		this.#stopSnake('quit');
	}

	// Arrow keys/WASD steer and q or Esc quits while a game is on; returns true when used.
	snakeKey(event: KeyboardEvent): boolean {
		if (!this.#snake) return false;
		const k = event.key.toLowerCase();
		const dir = SNAKE_KEYS[k];
		if (dir) {
			event.preventDefault();
			this.snakeTurn(dir);
			return true;
		}
		if (k === 'q' || k === 'escape') {
			event.preventDefault();
			this.snakeQuit();
			return true;
		}
		return false;
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
				this.#stopSnake('restart');
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

	unlock(key: Parameters<Shell['unlock']>[0]) {
		this.shell?.unlock(key);
	}
}
