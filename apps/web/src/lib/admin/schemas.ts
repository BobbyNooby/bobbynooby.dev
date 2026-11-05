import { toAnilistId } from '$lib/anilist/anilistId';
import { safeHref } from '$lib/bsh/format';
import { z } from 'zod';

// The save rules for /customize. The server enforces them; the editor runs the
// same ones so a bad field is marked before Save instead of failing after it.

// The same check the home page renders links with, so a saved link never disappears there.
const href = z
	.string()
	.max(2048)
	.refine((value) => safeHref(value) != null);
// A whitespace-only name would show nothing on the site.
const name = (max: number) =>
	z
		.string()
		.max(max)
		.refine((value) => value.trim() !== '');
const hexOrColorName = /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/;
const safeListLabel = /^[a-zA-Z0-9 _-]+$/;
const decimalText = z
	.string()
	.regex(/^\d+(\.\d+)?$/)
	.transform(Number);

// visible is deliberately absent: it is client-only UI state and is stripped
// from the payload by zod's default key filtering.
export const linkSchema = z.object({
	uid: z.number().int(),
	label: name(100),
	href,
	color: z.string().max(64).regex(hexOrColorName)
});

export const projectSchema = z.object({
	uid: z.number().int(),
	title: name(200),
	description: z.string().max(5000),
	href
});

// bobscore is stored 0-1. Decimal text is still read as a number in case an
// old row holds one, but not via coercion, which turns "", null and [] into 0.
// id keeps whatever type the row was created with (legacy rows store numbers).
// review is absent on most legacy rows, so it stays optional.
export const entrySchema = z.object({
	uid: z.number().int(),
	id: z.union([z.string(), z.number()]).refine((id) => toAnilistId(id) != null),
	label: name(200),
	review: z.string().max(10000).optional(),
	bobscore: z.union([z.number(), decimalText]).pipe(z.number().min(0).max(1))
});

export const listSchema = z.object({
	label: z.string().max(100).regex(safeListLabel),
	data: z.array(entrySchema)
});

/** The top-level fields of `row` that `schema` rejects. */
export function issues(schema: z.ZodType, row: unknown): Set<string> {
	const result = schema.safeParse(row);
	if (result.success) return new Set();
	return new Set(result.error.issues.map((issue) => String(issue.path[0])));
}

/**
 * What the id field stores for typed text: a number when it is a valid id, so
 * retyping a legacy number id is not a change, else the text as typed.
 */
export function idFromInput(text: string): string | number {
	return toAnilistId(text) ?? text;
}

/** A 3x3 entry's problems. */
export function entryIssues(entry: z.input<typeof entrySchema>): Set<string> {
	return issues(entrySchema, entry);
}
