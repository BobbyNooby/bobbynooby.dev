import { createShortURL } from '$lib/shortURL/shortURL';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

// URL validation function
function isValidURL(url: string): boolean {
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
export const load = async ({ locals }) => {
	return { isSessionValid: locals.canShorten };
};

export const actions = {
	create: async (event) => {
		// Verify session
		if (!event.locals.canShorten) {
			return fail(403, {
				error: true,
				message: 'You are not authorized to use this url shortener'
			});
		}

		const formData = await event.request.formData();
		const longURL = formData.get('longURL');

		// Validate URL
		if (!longURL || typeof longURL !== 'string') {
			return fail(400, {
				error: true,
				message: 'Long URL is required'
			});
		}

		// URL validation
		if (!isValidURL(longURL)) {
			return fail(400, {
				error: true,
				message: 'Invalid URL format. Please provide a valid URL.'
			});
		}

		try {
			const shortURLResponse = await createShortURL(longURL);

			if (shortURLResponse.success) {
				return {
					success: true,
					shortURL: shortURLResponse.shortURL
				};
			}

			return fail(500, {
				error: true,
				message: shortURLResponse.error
			});
		} catch (err) {
			return fail(500, {
				error: true,
				message: err instanceof Error ? err.message : 'Unknown error occurred'
			});
		}
	}
} satisfies Actions;
