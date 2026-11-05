// The name rule shared by the shell and the chat box, mirroring the server's so a
// rename it would refuse is refused here first.
export const MAX_NAME = 24;

// Bidi overrides, zero-width spaces and other format characters. ZWJ stays: it joins emoji.
const FORMAT = /(?!\u200D)\p{Cf}/gu;
// Hangul fillers and the blank braille cell render as nothing, so they don't count.
const VISIBLE = /[^\s\p{C}\p{Z}\p{M}\u115F\u1160\u3164\uFFA0\u2800]/u;

function characters(s: string): string[] {
	if (typeof Intl.Segmenter !== 'function') return Array.from(s);
	return Array.from(
		new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(s),
		(g) => g.segment
	);
}

/** The name to use, cut to MAX_NAME without splitting a character; '' when nothing visible is left. */
export function cleanName(raw: string): string {
	let name = '';
	for (const c of characters(raw.replace(FORMAT, '').trim())) {
		if (name.length + c.length > MAX_NAME) break;
		name += c;
	}
	name = name.trim();
	return VISIBLE.test(name) ? name : '';
}
