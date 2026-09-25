const allowedOrigins = ['https://bobbynooby.dev', 'https://www.bobbynooby.dev'];

export function corsHeaders(origin: string | null): Record<string, string> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Allow-Methods': 'GET, OPTIONS'
	};
	if (origin && allowedOrigins.includes(origin)) {
		headers['Access-Control-Allow-Origin'] = origin;
	}
	return headers;
}
