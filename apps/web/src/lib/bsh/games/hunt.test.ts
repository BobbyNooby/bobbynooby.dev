import { describe, expect, it } from 'vitest';
import { mulberry32, type Rng } from '../rng';
import { textOf } from '../testing';
import { huntTurn, startHunt, type HuntState } from './hunt';

const draws =
	(...xs: number[]): Rng =>
	() => {
		if (!xs.length) throw new Error('unexpected rng draw');
		return xs.shift()!;
	};
const fresh = (): HuntState => startHunt().state;

describe('startHunt', () => {
	it('starts at full health with two potions', () => {
		const { state, lines } = startHunt();
		expect(state).toEqual({ mon: 30, you: 20, pots: 2 });
		expect(textOf(lines).split('\n')).toEqual([
			'A wild Honkalos lands on /Games. It is a goose that learned to fly angrier.',
			'you [██████████] 20/20   honkalos [██████████] 30/30   potions 2',
			'[a]ttack  [d]odge  [p]otion  [r]un'
		]);
	});
});

describe('huntTurn', () => {
	it('attacks for 4-8, then Honkalos hits back for 3-7', () => {
		const low = huntTurn(fresh(), 'a', draws(0, 0));
		expect(low.state).toEqual({ mon: 26, you: 17, pots: 2 });
		expect(textOf(low.lines)).toBe(
			'you hit Honkalos for 4.\nHonkalos honks at you for 3.\n' +
				'you [█████████░] 17/20   honkalos [█████████░] 26/30   potions 2'
		);
		const high = huntTurn(fresh(), 'a', draws(0.99, 0.99));
		expect(high.state).toEqual({ mon: 22, you: 13, pots: 2 });
		expect(high.end).toBeNull();
	});

	it('dodges three times in four', () => {
		const miss = huntTurn(fresh(), 'd', draws(0.74));
		expect(miss.state).toEqual(fresh());
		expect(textOf(miss.lines)).toContain('you roll out of the way.\nHonkalos swings and misses.');
		const hit = huntTurn(fresh(), 'd', draws(0.75, 0));
		expect(hit.state.you).toBe(17);
	});

	it('drinks a potion for +8, capped at 20', () => {
		const hurt = { mon: 30, you: 5, pots: 2 };
		const p = huntTurn(hurt, 'p', draws(0));
		expect(p.state).toEqual({ mon: 30, you: 10, pots: 1 });
		expect(textOf(p.lines)).toContain('you drink a potion (+8) and do the little flex.');
		expect(huntTurn({ ...hurt, you: 18 }, 'p', draws(0.99)).state.you).toBe(13);
	});

	it('still gets hit when out of potions', () => {
		const t = huntTurn({ mon: 30, you: 20, pots: 0 }, 'p', draws(0));
		expect(t.lines[0]).toEqual([{ t: 'no potions left.', c: '#ef4444' }]);
		expect(t.state).toEqual({ mon: 30, you: 17, pots: 0 });
	});

	it('runs away without a draw', () => {
		const t = huntTurn(fresh(), 'r', draws());
		expect(t.end).toBe('ran');
		expect(t.lines).toEqual([[{ t: 'you run. Honkalos honks victoriously.', c: '#9ca3af' }]]);
	});

	it('repeats the keys for anything else', () => {
		for (const input of ['', 'x', '?']) {
			const t = huntTurn(fresh(), input, draws());
			expect(t).toEqual({
				state: fresh(),
				lines: [[{ t: '[a]ttack  [d]odge  [p]otion  [r]un', c: '#9ca3af' }]],
				end: null
			});
		}
	});

	it('wins without a counterattack', () => {
		const t = huntTurn({ mon: 4, you: 1, pots: 0 }, 'a', draws(0));
		expect(t.end).toBe('won');
		expect(t.lines.at(-1)).toEqual([
			{ t: 'Honkalos is down! You carve 1x Honk Plate.', c: '#facc15' }
		]);
	});

	it('faints at 0 HP', () => {
		const t = huntTurn({ mon: 30, you: 3, pots: 0 }, 'a', draws(0, 0));
		expect(t.end).toBe('lost');
		expect(t.lines.at(-1)).toEqual([
			{ t: 'you fainted. the cat carts you back to camp.', c: '#ef4444' }
		]);
	});

	it('reads only the first letter, in any case', () => {
		const rng = () => mulberry32(5);
		expect(huntTurn(fresh(), '  ATTACK  ', rng())).toEqual(huntTurn(fresh(), 'a', rng()));
		expect(huntTurn(fresh(), 'Run', draws()).end).toBe('ran');
	});

	it('leaves the old state alone', () => {
		const s = fresh();
		huntTurn(s, 'p', draws(0));
		huntTurn(s, 'a', draws(0, 0));
		expect(s).toEqual({ mon: 30, you: 20, pots: 2 });
	});
});
