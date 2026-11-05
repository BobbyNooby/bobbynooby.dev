import { describe, expect, it } from 'vitest';
import { snakeBoard } from './games/snake';
import { fixture, liveShell, runOn, textOf } from './testing';

const PROMPT = 'guest_4821@bobbynooby.dev:~$';

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

describe('hunt', () => {
	it('takes over the prompt until you run', () => {
		const { shell } = liveShell();
		shell.run('hunt');
		expect(shell.promptText()).toBe('hunt>');
		shell.run('x');
		expect(shell.promptText()).toBe('hunt>');
		shell.run('r');
		expect(shell.promptText()).toBe(PROMPT);
		expect(shell.state.history).toEqual(['hunt']);
	});

	it('unlocks Honkalos Slayer on a win', () => {
		const out = textOf(runOn(fixture, ['hunt', 'a', 'd', 'a', 'p', 'a', 'a', 'a', 'a', 'pwd']));
		expect(out).toContain(
			'Honkalos is down! You carve 1x Honk Plate.\n+ achievement: Honkalos Slayer  ['
		);
		expect(out.endsWith(PROMPT + ' pwd\n~')).toBe(true);
	});

	it('starts with odd casing and spacing', () => {
		for (const cmd of ['HUNT', '  Hunt  ']) {
			const { shell } = liveShell();
			shell.run(cmd);
			expect(shell.promptText()).toBe('hunt>');
		}
	});
});
