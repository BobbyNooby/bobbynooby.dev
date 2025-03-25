import { createShortURL } from '$lib/shortURL/shortURL';
import { verifyShortURLSession } from '$lib/utils/verifySession.js';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

// URL validation function
function isValidURL(url: string): boolean {
	try {
		// Comprehensive URL regex
		const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

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
	const session = await locals.auth();

	const validSession = await verifyShortURLSession(session);

	return { isSessionValid: validSession == true ? true : false };
};

export const actions = {
	create: async (event) => {
		// Verify session
		const session = await event.locals.auth();
		const validSession = await verifyShortURLSession(session);

		if (validSession !== true) {
			return fail(403, {
				error: true,
				message: validSession
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
