import {
	createSnake,
	snakeBoard,
	stepSnake,
	turnSnake,
	type Point,
	type SnakeState
} from '$lib/bsh/games/snake';
import type { Rng } from '$lib/bsh/rng';
import type { Line } from '$lib/bsh/types';

const TICK_MS = 140;
const KEYS: Record<string, Point> = {
	arrowup: [0, -1],
	w: [0, -1],
	arrowdown: [0, 1],
	s: [0, 1],
	arrowleft: [-1, 0],
	a: [-1, 0],
	arrowright: [1, 0],
	d: [1, 0]
};

export type SnakeEnd = 'crash' | 'quit' | 'restart';

/** Where the game draws: the shell's output lines, addressed by id. */
export type SnakeScreen = {
	print(segs: Line, kind?: 'snake' | 'pad'): number;
	replace(id: number, segs: Line): void;
	remove(id: number): void;
};

// One game of snake inside the shell output: a board line, a score line and
// the touch pad. The engine only says "start"; the rest happens here.
export class SnakeGame {
	#state: SnakeState;
	#board: number;
	#info: number;
	#pad: number;
	#timer: ReturnType<typeof setInterval> | undefined;
	#stopped = false;
	#screen: SnakeScreen;
	#rng: Rng;
	#onEnd: (why: SnakeEnd, score: number) => void;

	constructor(screen: SnakeScreen, rng: Rng, onEnd: (why: SnakeEnd, score: number) => void) {
		this.#screen = screen;
		this.#rng = rng;
		this.#onEnd = onEnd;
		this.#state = createSnake(rng);
		this.#board = screen.print([{ t: snakeBoard(this.#state) }], 'snake');
		this.#info = screen.print([{ t: '', c: '#9ca3af' }]);
		this.#pad = screen.print([], 'pad');
		this.#draw();
	}

	#draw() {
		this.#screen.replace(this.#board, [{ t: snakeBoard(this.#state) }]);
		this.#screen.replace(this.#info, [
			{
				t:
					'score ' +
					this.#state.score +
					(this.#state.started ? '' : ' · press a direction to start') +
					' · q quits',
				c: '#9ca3af'
			}
		]);
	}

	turn(dir: Point) {
		const wasStarted = this.#state.started;
		this.#state = turnSnake(this.#state, dir);
		if (!wasStarted && this.#state.started) {
			this.#timer = setInterval(() => {
				this.#state = stepSnake(this.#state, this.#rng);
				if (this.#state.over) this.stop('crash');
				else this.#draw();
			}, TICK_MS);
		}
		this.#draw();
	}

	/** Arrow keys or WASD steer, q or Esc quits; returns true when the key was used. */
	key(event: KeyboardEvent): boolean {
		// Cmd+A, Ctrl+W and friends belong to the browser.
		if (event.ctrlKey || event.metaKey || event.altKey) return false;
		const k = event.key.toLowerCase();
		const dir = KEYS[k];
		if (dir) {
			event.preventDefault();
			this.turn(dir);
			return true;
		}
		if (k === 'q' || k === 'escape') {
			event.preventDefault();
			this.stop('quit');
			return true;
		}
		return false;
	}

	stop(why: SnakeEnd) {
		if (this.#stopped) return;
		this.#stopped = true;
		clearInterval(this.#timer);
		this.#screen.remove(this.#pad);
		const score = this.#state.score;
		if (why !== 'restart') {
			this.#screen.print([
				{
					t:
						(why === 'crash' ? 'game over. ' : 'quit. ') +
						'score ' +
						score +
						(score >= 10 ? '' : '   (10 unlocks something)'),
					c: why === 'crash' ? '#ef4444' : '#9ca3af'
				}
			]);
		}
		this.#onEnd(why, score);
	}
}
