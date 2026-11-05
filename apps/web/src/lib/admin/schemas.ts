import { z } from 'zod';

// The save rules for /customize. The server enforces them; the editor runs the
// same ones so a bad field is marked before Save instead of failing after it.

const safeHref = /^(https?:\/\/|\/)/i;
const hexOrColorName = /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/;
const safeListLabel = /^[a-zA-Z0-9 _-]+$/;

// visible is deliberately absent: it is client-only UI state and is stripped
// from the payload by zod's default key filtering.
export const linkSchema = z.object({
	uid: z.number().int(),
	label: z.string().min(1).max(100),
	href: z.string().min(1).max(2048).regex(safeHref),
	color: z.string().max(64).regex(hexOrColorName)
});

export const projectSchema = z.object({
	uid: z.number().int(),
	title: z.string().min(1).max(200),
	description: z.string().max(5000),
	href: z.string().min(1).max(2048).regex(safeHref)
});

// bobscore arrives as a string from the text input, hence the coercion.
// id keeps whatever type the row was created with (legacy rows store numbers).
// review is absent on most legacy rows, so it stays optional.
export const entrySchema = z.object({
	uid: z.number().int(),
	id: z.union([z.string().max(200), z.number()]),
	label: z.string().min(1).max(200),
	review: z.string().max(10000).optional(),
	bobscore: z.coerce.number()
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
 * A 3x3 entry's problems. Stricter than the server in two places: an empty
 * AniList id would save a tile that can never load, and a blank label passes
 * min(1) but shows nothing on the tile.
 */
export function entryIssues(entry: z.input<typeof entrySchema>): Set<string> {
	const found = issues(entrySchema, entry);
	if (String(entry.id).trim() === '') found.add('id');
	if (String(entry.label).trim() === '') found.add('label');
	if (Number.isNaN(Number(entry.bobscore))) found.add('bobscore');
	return found;
}
