const MAX_LENGTH = 2048;

/**
 * Returns the link as it should be stored (always with an http/https scheme),
 * or null if it is not a link to a web page.
 */
export function normalizeURL(input: string): string | null {
	const trimmed = input.trim();
	if (trimmed.length < 3 || trimmed.length > MAX_LENGTH) return null;

	// Only "scheme://" counts as a scheme, so "example.com:8080" still gets https://
	// and "javascript:..." becomes an unparseable host:port instead.
	const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

	let url: URL;
	try {
		url = new URL(withScheme);
	} catch {
		return null;
	}
	if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
	if (!url.hostname.includes('.') && !url.hostname.startsWith('[')) return null;
	return url.href.length <= MAX_LENGTH ? url.href : null;
}
