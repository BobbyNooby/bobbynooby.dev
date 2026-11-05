import type { Rng } from '../rng';
import type { Line } from '../types';

export type HuntState = { readonly mon: number; readonly you: number; readonly pots: number };
export type HuntEnd = 'won' | 'lost' | 'ran';
export type HuntTurn = { state: HuntState; lines: Line[]; end: HuntEnd | null };

const YOU_MAX = 20;
const MON_MAX = 30;

const line = (t: string, c?: string): Line => [{ t, c }];
const menu = () => line('[a]ttack  [d]odge  [p]otion  [r]un', '#9ca3af');
const hpBar = (v: number, max: number) => {
	const f = Math.max(0, Math.min(10, Math.round((v / max) * 10)));
	return '[' + '█'.repeat(f) + '░'.repeat(10 - f) + ']';
};
const status = (g: HuntState): Line => [
	{ t: 'you ' + hpBar(g.you, YOU_MAX) + ' ' + Math.max(0, g.you) + '/' + YOU_MAX, c: '#4ade80' },
	{
		t: '   honkalos ' + hpBar(g.mon, MON_MAX) + ' ' + Math.max(0, g.mon) + '/' + MON_MAX,
		c: '#ef4444'
	},
	{ t: '   potions ' + g.pots, c: '#9ca3af' }
];

export function startHunt(): { state: HuntState; lines: Line[] } {
	const state = { mon: MON_MAX, you: YOU_MAX, pots: 2 };
	return {
		state,
		lines: [
			[
				{ t: 'A wild ' },
				{ t: 'Honkalos', c: '#facc15' },
				{ t: ' lands on /Games. It is a goose that learned to fly angrier.' }
			],
			status(state),
			menu()
		]
	};
}

export function huntTurn(g: HuntState, input: string, rng: Rng): HuntTurn {
	const k = input.trim().toLowerCase()[0];
	const lines: Line[] = [];
	let { mon, you, pots } = g;
	let dodge = false;
	if (k === 'a') {
		const d = 4 + Math.floor(rng() * 5);
		mon -= d;
		lines.push(line('you hit Honkalos for ' + d + '.'));
	} else if (k === 'd') {
		dodge = true;
		lines.push(line('you roll out of the way.'));
	} else if (k === 'p') {
		if (pots > 0) {
			pots--;
			you = Math.min(YOU_MAX, you + 8);
			lines.push(line('you drink a potion (+8) and do the little flex.'));
		} else lines.push(line('no potions left.', '#ef4444'));
	} else if (k === 'r') {
		return {
			state: g,
			lines: [line('you run. Honkalos honks victoriously.', '#9ca3af')],
			end: 'ran'
		};
	} else return { state: g, lines: [menu()], end: null };

	if (mon <= 0) {
		lines.push(line('Honkalos is down! You carve 1x Honk Plate.', '#facc15'));
		return { state: { mon, you, pots }, lines, end: 'won' };
	}
	if (dodge && rng() < 0.75) lines.push(line('Honkalos swings and misses.', '#9ca3af'));
	else {
		const d = 3 + Math.floor(rng() * 5);
		you -= d;
		lines.push(line('Honkalos honks at you for ' + d + '.', '#ef4444'));
	}
	const state = { mon, you, pots };
	if (you <= 0) {
		lines.push(line('you fainted. the cat carts you back to camp.', '#ef4444'));
		return { state, lines, end: 'lost' };
	}
	lines.push(status(state));
	return { state, lines, end: null };
}
