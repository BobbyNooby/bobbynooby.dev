import type { Rng } from '../rng';

export const SNAKE_W = 26;
export const SNAKE_H = 11;

export type Point = readonly [x: number, y: number];
export type SnakeState = {
	readonly body: readonly Point[];
	readonly food: Point;
	readonly dir: Point;
	readonly next: Point;
	readonly score: number;
	readonly started: boolean;
	readonly over: boolean;
};

const same = (a: Point, b: Point) => a[0] === b[0] && a[1] === b[1];

// Picking from the free cells (not retrying random cells) means a full board can't spin forever.
function placeFood(body: readonly Point[], rng: Rng): Point | null {
	const free: Point[] = [];
	for (let y = 0; y < SNAKE_H; y++) {
		for (let x = 0; x < SNAKE_W; x++) {
			if (!body.some((b) => b[0] === x && b[1] === y)) free.push([x, y]);
		}
	}
	return free.length ? free[Math.floor(rng() * free.length)] : null;
}

export function createSnake(rng: Rng): SnakeState {
	const body: Point[] = [
		[8, 5],
		[7, 5],
		[6, 5],
		[5, 5]
	];
	return {
		body,
		food: placeFood(body, rng)!,
		dir: [1, 0],
		next: [1, 0],
		score: 0,
		started: false,
		over: false
	};
}

export function turnSnake(s: SnakeState, d: Point): SnakeState {
	const back = d[0] === -s.dir[0] && d[1] === -s.dir[1];
	// Before the first move the snake can just face the other way.
	if (back && !s.started)
		return { ...s, body: [...s.body].reverse(), dir: d, next: d, started: true };
	if (s.over || back) return s;
	return { ...s, next: d, started: true };
}

export function stepSnake(s: SnakeState, rng: Rng): SnakeState {
	if (s.over || !s.started) return s;
	const dir = s.next;
	const head: Point = [s.body[0][0] + dir[0], s.body[0][1] + dir[1]];
	const hit =
		head[0] < 0 ||
		head[1] < 0 ||
		head[0] >= SNAKE_W ||
		head[1] >= SNAKE_H ||
		s.body.slice(0, -1).some((b) => same(b, head));
	if (hit) return { ...s, dir, over: true };
	if (!same(head, s.food)) return { ...s, dir, body: [head, ...s.body.slice(0, -1)] };
	const body = [head, ...s.body];
	const food = placeFood(body, rng);
	return food
		? { ...s, dir, body, score: s.score + 1, food }
		: { ...s, dir, body, score: s.score + 1, over: true };
}

export function snakeBoard(s: Pick<SnakeState, 'body' | 'food'>, w = SNAKE_W, h = SNAKE_H): string {
	const rows = ['+' + '-'.repeat(w) + '+'];
	for (let y = 0; y < h; y++) {
		let r = '|';
		for (let x = 0; x < w; x++) {
			const bi = s.body.findIndex((b) => b[0] === x && b[1] === y);
			r += bi === 0 ? '@' : bi > 0 ? 'o' : s.food[0] === x && s.food[1] === y ? '*' : ' ';
		}
		rows.push(r + '|');
	}
	rows.push('+' + '-'.repeat(w) + '+');
	return rows.join('\n');
}
