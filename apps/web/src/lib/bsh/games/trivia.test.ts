import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../rng';
import { fixture, textOf } from '../testing';
import type { BshData, BshGame, BshMedia } from '../types';
import { answerTrivia, startTrivia, triviaQuestions, type TriviaState } from './trivia';

const SEED = 20261104;
const game = (name: string, hours: number): BshGame => ({
	appid: 0,
	name,
	hours,
	lastPlayed: null
});
const manga = (label: string, review: string | null): BshMedia => ({
	label,
	review,
	anilistId: null,
	title: null,
	cover: null,
	color: null
});
const data = (
	games: BshGame[],
	mangaRows: BshMedia[]
): Pick<BshData, 'games' | 'threeByThree'> => ({
	games,
	threeByThree: { manga: mangaRows }
});
const fourGames = [game('A', 40), game('B', 30), game('C', 20), game('D', 10)];
const twoManga = [manga('Short', 'tiny review'), manga('Other', null)];
const asked = (d: Pick<BshData, 'games' | 'threeByThree'>) =>
	triviaQuestions(d, mulberry32(SEED)).map((q) => q.q);

describe('triviaQuestions', () => {
	it('asks the recorded questions for the fixed seed', () => {
		expect(triviaQuestions(fixture, mulberry32(SEED))).toEqual([
			{
				q: 'Which game has bobby put the most hours into?',
				opts: ['TEKKEN 8', 'MONSTER HUNTER RISE', 'Counter-Strike 2', 'ELDEN RING'],
				ans: 2
			},
			{
				q: '"Saata Aandagi" is bobby\'s review of which manga?',
				opts: ['Azumanga Daioh', 'Kaguya-sama Love is War', 'Beastars', 'Cigarette and Cherry'],
				ans: 0
			},
			{
				q: 'How many hours has bobby played Monster Hunter Wilds?',
				opts: ['5h', '217h', '65h', '150h'],
				ans: 1
			}
		]);
	});

	it('only quotes manga reviews of 40 characters or fewer', () => {
		const long = [manga('Long', 'x'.repeat(41)), manga('Other', null)];
		expect(asked(data(fourGames, long))).toEqual([
			'Which game has bobby put the most hours into?',
			'How many hours has bobby played C?'
		]);
		const fits = [manga('Fits', 'y'.repeat(40)), manga('Other', null)];
		expect(asked(data(fourGames, fits))).toHaveLength(3);
	});

	it('skips the hours question with fewer than 3 games', () => {
		expect(asked(data(fourGames.slice(0, 2), twoManga))).toEqual([
			'Which game has bobby put the most hours into?',
			'"tiny review" is bobby\'s review of which manga?'
		]);
	});

	it('skips a question with no wrong answer to offer', () => {
		expect(asked(data([game('Solo', 5)], twoManga))).toEqual([
			'"tiny review" is bobby\'s review of which manga?'
		]);
		expect(asked(data(fourGames, [manga('Only', 'tiny review')]))).toHaveLength(2);
		const sameHours = [game('A', 40), game('B', 20), game('C', 20)];
		expect(asked(data(sameHours, []))).toEqual([
			'Which game has bobby put the most hours into?',
			'How many hours has bobby played C?'
		]);
		expect(asked(data([game('A', 7), game('B', 7), game('C', 7)], []))).toHaveLength(1);
	});

	it('copes with no manga category at all', () => {
		expect(asked({ games: fourGames, threeByThree: {} })).toHaveLength(2);
	});
});

describe('startTrivia', () => {
	it('prints the first question', () => {
		const { state, lines } = startTrivia(fixture, mulberry32(SEED));
		expect(state).toMatchObject({ i: 0, score: 0 });
		expect(textOf(lines).split('\n')).toEqual([
			'bobby trivia. answer a, b, c or d.',
			'Q1/3  Which game has bobby put the most hours into?',
			'   a)  TEKKEN 8',
			'   b)  MONSTER HUNTER RISE',
			'   c)  Counter-Strike 2',
			'   d)  ELDEN RING'
		]);
	});

	it('refuses when there is nothing to ask', () => {
		const t = startTrivia(data([], [manga('Long', 'x'.repeat(41))]), mulberry32(SEED));
		expect(t).toEqual({
			state: null,
			lines: [[{ t: 'trivia needs your site data.', c: '#ef4444' }]]
		});
	});
});

describe('answerTrivia', () => {
	const start = (): TriviaState => startTrivia(fixture, mulberry32(SEED)).state!;

	it('scores a right answer and asks the next question', () => {
		const step = answerTrivia(start(), 'c');
		expect(step.state).toMatchObject({ i: 1, score: 1 });
		expect(step.done).toBe(false);
		expect(step.lines[0]).toEqual([{ t: 'correct!', c: '#4ade80' }]);
		expect(textOf(step.lines.slice(1, 2))).toMatch(/^Q2\/3 {2}"Saata Aandagi"/);
	});

	it('shows the right answer after a wrong one', () => {
		const step = answerTrivia(start(), 'a');
		expect(step.state).toMatchObject({ i: 1, score: 0 });
		expect(step.lines[0]).toEqual([{ t: 'nope, it was c)  Counter-Strike 2', c: '#ef4444' }]);
	});

	it('asks again on anything but a letter a-d', () => {
		for (const input of ['', 'x', '?', 'e']) {
			const s = start();
			expect(answerTrivia(s, input)).toEqual({
				state: s,
				lines: [[{ t: 'a, b, c or d', c: '#9ca3af' }]],
				done: false
			});
		}
	});

	it('asks again on a letter that is not an option for this question', () => {
		const two: TriviaState = { qs: [{ q: '?', opts: ['x', 'y'], ans: 0 }], i: 0, score: 0 };
		for (const input of ['c', 'd', 'D']) {
			expect(answerTrivia(two, input)).toEqual({
				state: two,
				lines: [[{ t: 'a or b', c: '#9ca3af' }]],
				done: false
			});
		}
		const three: TriviaState = { qs: [{ q: '?', opts: ['x', 'y', 'z'], ans: 0 }], i: 0, score: 0 };
		expect(answerTrivia(three, 'd').lines).toEqual([[{ t: 'a, b or c', c: '#9ca3af' }]]);
		expect(answerTrivia(three, 'c').state.i).toBe(1);
	});

	it('reads the first letter in any case', () => {
		expect(answerTrivia(start(), '  C  ').state.score).toBe(1);
		expect(answerTrivia(start(), 'Counter').state.score).toBe(1);
	});

	it('finishes with the score', () => {
		const s = ['c', 'a'].reduce((t, a) => answerTrivia(t, a).state, start());
		const done = answerTrivia(s, 'b');
		expect(done.done).toBe(true);
		expect(done.state).toMatchObject({ i: 3, score: 3 });
		expect(done.lines).toEqual([
			[{ t: 'correct!', c: '#4ade80' }],
			[{ t: 'score 3/3. you know your bobby.', c: '#facc15' }]
		]);
	});

	it('says study harder below a perfect score', () => {
		const s = ['d', 'd'].reduce((t, a) => answerTrivia(t, a).state, start());
		expect(answerTrivia(s, 'd').lines.at(-1)).toEqual([
			{ t: 'score 0/3. study harder.', c: '#facc15' }
		]);
	});

	it('leaves the old state alone', () => {
		const s = start();
		answerTrivia(s, 'c');
		expect(s).toMatchObject({ i: 0, score: 0 });
	});
});
