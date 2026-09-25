import { createShortURL } from '$lib/shortURL/shortURL';
import { isValidURL } from '$lib/shortURL/isValidURL';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

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
