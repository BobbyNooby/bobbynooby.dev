import { describe, expect, it } from 'vitest';
import { snakeBoard } from './games/snake';
import { fixture, liveShell, runOn, textOf } from './testing';

describe('snake', () => {
	it('hands the game to the page', () => {
		const out = textOf(runOn(fixture, ['snake']));
		expect(out).not.toContain('command not found');
		expect(out).toContain(
			snakeBoard(
				{
					body: [
						[9, 4],
						[8, 4],
						[7, 4],
						[6, 4]
					],
					food: [17, 2]
				},
				26,
				8
			)
		);
	});

	it('unlocks Snake Charmer when the page reports a score of 10', () => {
		const { shell, lines } = liveShell();
		shell.unlock('snake');
		expect(textOf(lines())).toMatch(/^\+ achievement: Snake Charmer {2}\[/);
	});
});
