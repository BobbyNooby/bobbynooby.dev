import { describe, expect, it } from 'vitest';
import { snakeBoard } from './games/snake';
import { fixture, liveShell, runOn, textOf } from './testing';
import type { BshData } from './types';

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

describe('trivia', () => {
	const noShortReviews: BshData = {
		...fixture,
		threeByThree: {
			...fixture.threeByThree,
			manga: fixture.threeByThree.manga.map((m) => ({ ...m, review: null }))
		}
	};

	it('takes over the prompt until the last answer', () => {
		const { shell } = liveShell();
		shell.run('trivia');
		expect(shell.promptText()).toBe('answer>');
		shell.run('x');
		shell.run('c');
		shell.run('a');
		expect(shell.promptText()).toBe('answer>');
		shell.run('d');
		expect(shell.promptText()).toBe(PROMPT);
		expect(shell.state.history).toEqual(['trivia']);
	});

	it('unlocks Know Your Bobby only on 3/3', () => {
		const perfect = textOf(runOn(fixture, ['trivia', 'c', 'a', 'b']));
		expect(perfect).toContain('score 3/3. you know your bobby.\n+ achievement: Know Your Bobby  [');
		const flop = textOf(runOn(fixture, ['trivia', 'c', 'a', 'd']));
		expect(flop).toContain('score 2/3. study harder.');
		expect(flop).not.toContain('Know Your Bobby');
	});

	it('asks two questions with fewer than 3 games', () => {
		const out = textOf(runOn({ ...fixture, games: fixture.games.slice(0, 2) }, ['trivia']));
		expect(out).toContain('Q1/2  Which game has bobby put the most hours into?');
		expect(out).not.toContain('How many hours');
	});

	it('asks two questions with no short manga review', () => {
		const out = textOf(runOn(noShortReviews, ['trivia', 'c']));
		expect(out).toContain('Q1/2');
		expect(out).toContain('Q2/2  How many hours has bobby played Monster Hunter Wilds?');
	});

	it('refuses with nothing to ask and stays at the shell prompt', () => {
		const { shell, lines } = liveShell({ ...noShortReviews, games: [] });
		shell.run('trivia');
		expect(lines().at(-1)).toEqual([{ t: 'trivia needs your site data.', c: '#ef4444' }]);
		expect(shell.promptText()).toBe(PROMPT);
	});

	it('takes odd casing and spacing', () => {
		const out = textOf(runOn(fixture, ['  TRIVIA ', '  C  ', 'A', ' b']));
		expect(out).toContain('score 3/3');
	});
});
