import { fmtHours } from '../format';
import { shuffle, type Rng } from '../rng';
import type { BshData, Line } from '../types';

export type Question = { q: string; opts: string[]; ans: number };
export type TriviaState = {
	readonly qs: readonly Question[];
	readonly i: number;
	readonly score: number;
};
export type TriviaStep = { state: TriviaState; lines: Line[]; done: boolean };

type TriviaData = Pick<BshData, 'games' | 'threeByThree'>;

const KEYS = 'abcd';
const MAX_REVIEW = 40;

const line = (t: string, c?: string): Line => [{ t, c }];

// A question needs a wrong answer to be a question, so sparse data skips it.
function question(rng: Rng, q: string, right: string, wrong: string[]): Question | null {
	if (!wrong.length) return null;
	const opts = shuffle(rng, [right, ...wrong.slice(0, 3)]);
	return { q, opts, ans: opts.indexOf(right) };
}

// The rng is drawn in the prototype's order, so a seed asks the same questions.
export function triviaQuestions(data: TriviaData, rng: Rng): Question[] {
	const { games } = data;
	const qs: (Question | null)[] = [];
	if (games.length) {
		const wrong = shuffle(rng, games.slice(1, 9)).map((g) => g.name);
		qs.push(question(rng, 'Which game has bobby put the most hours into?', games[0].name, wrong));
	}
	const manga = data.threeByThree.manga ?? [];
	const short = manga.filter((m) => m.review && m.review.length <= MAX_REVIEW);
	const reviewed = shuffle(rng, short);
	if (reviewed.length) {
		const m = reviewed[0];
		const rest = manga.filter((x) => x !== m);
		const wrong = shuffle(rng, rest).map((x) => x.label);
		qs.push(question(rng, '"' + m.review + '" is bobby\'s review of which manga?', m.label, wrong));
	}
	const g3 = games[2];
	if (g3) {
		const others = games.filter((g) => g.hours !== g3.hours).map((g) => fmtHours(g.hours));
		const wrong = shuffle(rng, [...new Set(others)]);
		qs.push(
			question(rng, 'How many hours has bobby played ' + g3.name + '?', fmtHours(g3.hours), wrong)
		);
	}
	return qs.filter((q) => q !== null);
}

function ask(s: TriviaState): Line[] {
	const q = s.qs[s.i];
	return [
		[{ t: 'Q' + (s.i + 1) + '/' + s.qs.length + '  ', c: '#facc15' }, { t: q.q }],
		...q.opts.map((o, k) => line('   ' + KEYS[k] + ')  ' + o))
	];
}

export function startTrivia(
	data: TriviaData,
	rng: Rng
): { state: TriviaState | null; lines: Line[] } {
	const qs = triviaQuestions(data, rng);
	if (!qs.length) return { state: null, lines: [line('trivia needs your site data.', '#ef4444')] };
	const state = { qs, i: 0, score: 0 };
	return { state, lines: [line('bobby trivia. answer a, b, c or d.', '#9ca3af'), ...ask(state)] };
}

// "a or b", "a, b or c", "a, b, c or d"
const choices = (n: number) => [...KEYS.slice(0, n)].join(', ').replace(/, (\w)$/, ' or $1');

export function answerTrivia(s: TriviaState, input: string): TriviaStep {
	const q = s.qs[s.i];
	const k = KEYS.slice(0, q.opts.length).indexOf(input.trim().toLowerCase()[0] ?? '?');
	if (k < 0) return { state: s, lines: [line(choices(q.opts.length), '#9ca3af')], done: false };
	const right = k === q.ans;
	const state = { ...s, i: s.i + 1, score: s.score + (right ? 1 : 0) };
	const lines = [
		right
			? line('correct!', '#4ade80')
			: line('nope, it was ' + KEYS[q.ans] + ')  ' + q.opts[q.ans], '#ef4444')
	];
	if (state.i < s.qs.length) return { state, lines: [...lines, ...ask(state)], done: false };
	const perfect = state.score === s.qs.length;
	lines.push(
		line(
			'score ' +
				state.score +
				'/' +
				s.qs.length +
				(perfect ? '. you know your bobby.' : '. study harder.'),
			'#facc15'
		)
	);
	return { state, lines, done: true };
}
