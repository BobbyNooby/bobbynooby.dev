import { pick, type Rng } from '../rng';
import type { BshMedia, Line } from '../types';

const SSR = ['★★★', 'SSR', '#facc15'] as const;
const SR = ['★★', 'SR', '#60a5fa'] as const;
const R = ['★', 'R', '#9ca3af'] as const;

export function gachaPull(
	threeByThree: Record<string, BshMedia[]>,
	rng: Rng
): { lines: Line[]; pulled: boolean } {
	const pool = Object.keys(threeByThree).flatMap((cat) =>
		threeByThree[cat].map((m, i) => ({ m, cat, i }))
	);
	if (!pool.length) return { lines: [[{ t: 'nothing to pull yet.' }]], pulled: false };
	const p = pick(rng, pool);
	const [stars, rank, c] = p.m.review ? SSR : rng() < 0.35 ? SR : R;
	const where = p.cat + ' · #' + (p.i + 1);
	const inner = Math.max(20, p.m.label.length + 3, where.length + 3);
	const row = (t: string): Line => [{ t: '│ ' + t.padEnd(inner - 1) + '│', c }];
	const lines: Line[] = [
		[{ t: '┌' + '─'.repeat(inner) + '┐', c }],
		row(stars + '  ' + rank),
		row(p.m.label),
		row(where),
		[{ t: '└' + '─'.repeat(inner) + '┘', c }]
	];
	if (p.m.review) {
		const r = p.m.review;
		lines.push([{ t: '"' + (r.length > 90 ? r.slice(0, 88) + '…' : r) + '"', c: '#d1d5db' }]);
	}
	return { lines, pulled: true };
}
