import { pick, type Rng } from '../rng';
import type { BshMedia, Line } from '../types';

export function fortune(threeByThree: Record<string, BshMedia[]>, rng: Rng): Line[] {
	const all = Object.values(threeByThree).flatMap((rows) => rows.filter((m) => m.review));
	if (!all.length) return [[{ t: 'no fortunes yet.' }]];
	const m = pick(rng, all);
	return [
		[{ t: '"' + m.review + '"', c: '#f5f5f5' }],
		[{ t: '   — bobby on ' + (m.title || m.label), c: '#9ca3af' }]
	];
}
