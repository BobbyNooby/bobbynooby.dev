import { goto } from '$app/navigation';
import { getLongURL } from '$lib/shortURL/shortURL.js';

export async function load({ params }) {
	const response = await getLongURL(params.shortURL);

	if (response.success) {
		return {
			longURL: response.longURL,
			success: true
		};
	}

	return {
		longURL: '',
		success: false
	};
}
