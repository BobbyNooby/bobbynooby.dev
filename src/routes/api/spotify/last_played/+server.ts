import { GENERAL_AUTH_KEY } from '$env/static/private';
import { corsHeaders } from '$lib/corsHeaders.js';
import { supabaseClient } from '$lib/supabase.js';
import type { SpotifyLastPlayedData } from '$lib/supabaseUtils.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }): Promise<Response> {
	const requestData: SpotifyLastPlayedData = await request.json();

	try {
		const authKey = request.headers.get('authKey');

		if (authKey !== GENERAL_AUTH_KEY) {
			throw new Error('Brodie you really tryna do sumn with no auth!?!??!?! ');
		}
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}

	const { data, error } = await supabaseClient
		.from('spotifyLastPlayedSong')
		.update({ ...requestData })
		.eq('id', 1);

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json({ data }, { status: 200 });
}

export async function GET(): Promise<Response> {
	const { data, error } = await supabaseClient.from('spotifyLastPlayedSong').select().eq('uid', 1);

	if (error) {
		return json({ error: error.message }, { status: 500, headers: corsHeaders });
	} else {
		return json({ data }, { status: 200, headers: corsHeaders });
	}
}
