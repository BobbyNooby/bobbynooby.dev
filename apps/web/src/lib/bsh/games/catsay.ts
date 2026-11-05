import type { Line } from '../types';

export const CAT_ART: readonly string[] = [
	'        \\    /\\     /\\',
	'         \\  /  \\___/  \\',
	'           (  @     @  )',
	'            \\   vVv   /',
	"             '-------'"
];

const WRAP = 32;

function edges(i: number, n: number): [string, string] {
	if (n === 1) return ['<', '>'];
	if (i === 0) return ['/', '\\'];
	return i === n - 1 ? ['\\', '/'] : ['|', '|'];
}

export function catsay(msg: string): Line[] {
	const lines: string[] = [];
	let cur = '';
	for (const word of (msg.trim() || 'honk').split(/\s+/)) {
		// Only wrap after a word, so an over-long first word can't leave an empty line.
		if (cur && (cur + ' ' + word).length > WRAP) {
			lines.push(cur);
			cur = word;
		} else cur = cur ? cur + ' ' + word : word;
	}
	lines.push(cur);
	const w = Math.max(...lines.map((l) => l.length));
	return [
		[{ t: ' ' + '_'.repeat(w + 2) }],
		...lines.map((l, i): Line => {
			const [a, b] = edges(i, lines.length);
			return [{ t: a + ' ' + l.padEnd(w) + ' ' + b }];
		}),
		[{ t: ' ' + '-'.repeat(w + 2) }],
		...CAT_ART.map((t): Line => [{ t, c: '#f5f5f5' }])
	];
}
