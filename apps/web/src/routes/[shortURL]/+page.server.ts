import { normalizeURL } from '$lib/shortURL/normalizeURL';
import { getLongURL } from '$lib/shortURL/shortURL';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params }) {
	const response = await getLongURL(params.shortURL);
	// Re-checked on the way out: older links were saved without a scheme.
	const target = response.success ? normalizeURL(response.longURL) : null;
	if (!target) error(404, 'Short URL not found');
	redirect(302, target);
}
