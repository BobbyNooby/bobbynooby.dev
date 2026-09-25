export function pickClientIp(headers: Headers, fallback: string): string {
	const forwarded = headers.get('x-forwarded-for');
	if (forwarded) return forwarded.split(',')[0].trim();
	return fallback;
}
