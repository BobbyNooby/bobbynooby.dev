export async function getConnectURL(): Promise<string> {
	const localURLs = [
		'http://localhost:5170',
		'http://localhost:5171',
		'http://localhost:5172',
		'https://bobbynooby.dev',
		'http://localhost:5174',
		'http://localhost:5175',
		'http://localhost:5176',
		'http://localhost:5177',
		'http://localhost:5178',
		'http://localhost:5179'
	];

	for (const url of localURLs) {
		try {
			const response = await fetch(url, { method: 'HEAD' });
			if (response.ok) {
				return url;
			}
		} catch (error) {
			// Ignore errors and continue to the next URL
		}
	}

	// If no local URLs respond, return the fallback URL
	return 'https://bobbynooby.dev';
}
