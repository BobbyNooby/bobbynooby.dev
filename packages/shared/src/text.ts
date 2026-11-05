// Characters that draw nothing or flip the direction of the text around them
// (zero-width, bidi controls, Hangul fillers), so a name or message made of them
// looks empty or reversed.
const INVISIBLE =
	/[\u00ad\u034f\u061c\u115f\u1160\u180e\u200b-\u200f\u202a-\u202e\u2060-\u2069\u2800\u3164\ufeff\uffa0]/g;
const EMOJI_BEFORE = /[\p{Extended_Pictographic}\p{Emoji_Modifier}\ufe0f]$/u;
const EMOJI_AFTER = /^\p{Extended_Pictographic}/u;

/** Strips invisible characters and trims, keeping the joiners that build one emoji. */
export function cleanText(text: string): string {
	return text
		.replace(INVISIBLE, (ch: string, i: number) =>
			ch === '\u200d' &&
			EMOJI_BEFORE.test(text.slice(Math.max(0, i - 2), i)) &&
			EMOJI_AFTER.test(text.slice(i + 1, i + 3))
				? ch
				: ''
		)
		.trim();
}
