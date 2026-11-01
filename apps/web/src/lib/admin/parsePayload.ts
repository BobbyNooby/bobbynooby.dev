import type { z } from 'zod';

// A missing field must fail: saving replaces whole tables, so reading it as an
// empty list would delete every row. The editor sends "[]" for a real empty list.
export function parsePayload<T>(
	schema: z.ZodType<T[]>,
	raw: FormDataEntryValue | null,
	name: string
): T[] {
	if (typeof raw !== 'string' || raw.length === 0) {
		throw new Error(`Missing ${name}`);
	}
	let value: unknown;
	try {
		value = JSON.parse(raw);
	} catch {
		throw new Error(`Malformed JSON in ${name}`);
	}
	const parsed = schema.safeParse(value);
	if (!parsed.success) {
		const issue = parsed.error.issues[0];
		throw new Error(`Invalid ${name}: ${issue.path.join('.')} ${issue.message}`);
	}
	return parsed.data;
}
