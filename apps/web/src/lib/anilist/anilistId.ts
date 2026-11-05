// AniList ids are positive 32-bit ints. Ids typed in the editor are digit
// strings; legacy 3x3 rows store numbers.
const MAX_ANILIST_ID = 2147483647;

/** The AniList id `id` names, or null when it cannot be one. */
export function toAnilistId(id: string | number): number | null {
	const n = typeof id === 'number' ? id : /^\d{1,10}$/.test(id) ? Number(id) : NaN;
	return Number.isInteger(n) && n >= 1 && n <= MAX_ANILIST_ID ? n : null;
}
