// URL validation function
export function isValidURL(url: string): boolean {
	try {
		// More comprehensive URL regex
		const urlRegex =
			/^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+)(@?[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/;

		// Additional checks
		if (!urlRegex.test(url)) {
			return false;
		}

		// Length check
		if (url.length > 2048 || url.length < 3) {
			return false;
		}

		// Optional: More strict protocol check
		if (!url.startsWith('http://') && !url.startsWith('https://')) {
			url = `https://${url}`;
		}

		// Use URL constructor for additional validation
		const parsedURL = new URL(url);

		// Ensure hostname has at least one dot
		return parsedURL.hostname.includes('.');
	} catch {
		return false;
	}
}
