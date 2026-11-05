import { describe, expect, it } from 'vitest';
import goldenJson from '../fixtures/golden.json';
import { mulberry32 } from '../rng';
import type { GoldenCase } from '../testing';
import {
	createSnake,
	SNAKE_H,
	SNAKE_W,
	snakeBoard,
	stepSnake,
	turnSnake,
	type Point,
	type SnakeState
} from './snake';

const SEED = 20261104;
const at = (s: SnakeState, p: Point) => s.body.some((b) => b[0] === p[0] && b[1] === p[1]);
const playing = (over: Partial<SnakeState>): SnakeState => ({
	...createSnake(mulberry32(SEED)),
	started: true,
	...over
});

describe('createSnake', () => {
	it('starts as a four-cell snake heading right, waiting for a move', () => {
		const s = createSnake(mulberry32(SEED));
		expect(s.body).toEqual([
			[8, 5],
			[7, 5],
			[6, 5],
			[5, 5]
		]);
		expect(s).toMatchObject({ dir: [1, 0], next: [1, 0], score: 0, started: false, over: false });
	});

	it('places food from the rng, on the board and off the snake', () => {
		const s = createSnake(mulberry32(SEED));
		expect(createSnake(mulberry32(SEED)).food).toEqual(s.food);
		expect(s.food[0]).toBeGreaterThanOrEqual(0);
		expect(s.food[0]).toBeLessThan(SNAKE_W);
		expect(s.food[1]).toBeGreaterThanOrEqual(0);
		expect(s.food[1]).toBeLessThan(SNAKE_H);
		expect(at(s, s.food)).toBe(false);
	});
});

describe('turnSnake', () => {
	it('starts the game on the first turn', () => {
		const s = turnSnake(createSnake(mulberry32(SEED)), [0, -1]);
		expect(s).toMatchObject({ next: [0, -1], dir: [1, 0], started: true });
	});

	it('starts heading left on a first press of left, turning the snake around', () => {
		const s = turnSnake(createSnake(mulberry32(SEED)), [-1, 0]);
		expect(s).toMatchObject({ dir: [-1, 0], next: [-1, 0], started: true });
		expect(s.body).toEqual([
			[5, 5],
			[6, 5],
			[7, 5],
			[8, 5]
		]);
		const moved = stepSnake(s, mulberry32(1));
		expect(moved.over).toBe(false);
		expect(moved.body[0]).toEqual([4, 5]);
	});

	it('ignores a turn straight back into a moving snake', () => {
		const up = playing({ dir: [0, -1], next: [0, -1] });
		expect(turnSnake(up, [0, 1])).toBe(up);
	});

	it('leaves the old state alone', () => {
		const s = createSnake(mulberry32(SEED));
		turnSnake(s, [0, 1]);
		expect(s).toMatchObject({ next: [1, 0], started: false });
	});
});

describe('stepSnake', () => {
	it('does nothing until the first turn', () => {
		const s = createSnake(mulberry32(SEED));
		expect(stepSnake(s, mulberry32(1))).toBe(s);
	});

	it('moves the head along the queued direction and drops the tail', () => {
		const s = stepSnake(turnSnake(createSnake(mulberry32(SEED)), [0, 1]), mulberry32(1));
		expect(s.dir).toEqual([0, 1]);
		expect(s.body).toEqual([
			[8, 6],
			[8, 5],
			[7, 5],
			[6, 5]
		]);
		expect(s.score).toBe(0);
	});

	it('grows on food, scores, and puts new food off the snake', () => {
		const s = stepSnake(playing({ food: [9, 5] }), mulberry32(7));
		expect(s.body).toHaveLength(5);
		expect(s.body[0]).toEqual([9, 5]);
		expect(s.score).toBe(1);
		expect(at(s, s.food)).toBe(false);
		expect(stepSnake(playing({ food: [9, 5] }), mulberry32(7)).food).toEqual(s.food);
	});

	it('ends on a wall', () => {
		const s = stepSnake(playing({ body: [[SNAKE_W - 1, 0]], food: [0, 0] }), mulberry32(1));
		expect(s.over).toBe(true);
		expect(s.body).toEqual([[SNAKE_W - 1, 0]]);
		const top = stepSnake(playing({ body: [[3, 0]], dir: [0, -1], next: [0, -1] }), mulberry32(1));
		expect(top.over).toBe(true);
	});

	it('ends on its own body, but may chase its tail', () => {
		const loop: Point[] = [
			[5, 5],
			[6, 5],
			[6, 4],
			[5, 4],
			[4, 4]
		];
		const bite = { body: loop, dir: [-1, 0] as Point, next: [0, -1] as Point };
		expect(stepSnake(playing(bite), mulberry32(1)).over).toBe(true);
		const chase = stepSnake(playing({ ...bite, body: loop.slice(0, 4) }), mulberry32(1));
		expect(chase.over).toBe(false);
		expect(chase.body[0]).toEqual([5, 4]);
	});

	it('ends instead of hunting for food when the board is full', () => {
		const food: Point = [0, 0];
		const body: Point[] = [[1, 0]];
		for (let y = 0; y < SNAKE_H; y++) {
			for (let x = 0; x < SNAKE_W; x++) if (x + y > 1) body.push([x, y]);
		}
		body.push([0, 1]);
		const s = stepSnake(playing({ body, food, dir: [-1, 0], next: [-1, 0] }), mulberry32(1));
		expect(s).toMatchObject({ over: true, score: 1 });
		expect(s.body).toHaveLength(SNAKE_W * SNAKE_H);
	});

	it('stays put once over', () => {
		const s = playing({ over: true });
		expect(stepSnake(s, mulberry32(1))).toBe(s);
		expect(turnSnake(s, [0, 1])).toBe(s);
	});
});

describe('snakeBoard', () => {
	it('draws the prototype board', () => {
		const golden = (goldenJson as unknown as { eggs: GoldenCase[] }).eggs;
		const board = golden.find((c) => c.id === 'Snake')!.lines[1][0].t;
		const s = {
			body: [
				[9, 4],
				[8, 4],
				[7, 4],
				[6, 4]
			] as Point[],
			food: [17, 2] as Point
		};
		expect(snakeBoard(s, 26, 8)).toBe(board);
	});

	it('defaults to the 26x11 board', () => {
		const rows = snakeBoard({ ...createSnake(mulberry32(SEED)), food: [0, 0] }).split('\n');
		expect(rows).toHaveLength(SNAKE_H + 2);
		expect(rows.every((r) => r.length === SNAKE_W + 2)).toBe(true);
		expect(rows[1]).toBe('|*' + ' '.repeat(SNAKE_W - 1) + '|');
		expect(rows[6]).toBe('|     ooo@' + ' '.repeat(SNAKE_W - 9) + '|');
	});
});
