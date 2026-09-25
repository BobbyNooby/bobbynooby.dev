export function pickForwardedIp(
	forwarded: string | null | undefined,
	fallback: string
): string {
	const entries = (forwarded ?? '')
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean);
	return entries.at(-1) ?? fallback;
}
