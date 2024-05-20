import { corsHeaders } from '$lib/corsHeaders.js';
import { supabaseClient } from '$lib/supabase.js';
import type { SpotifyLastPlayedData } from '$lib/supabaseUtils.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }): Promise<Response> {
	const requestData: SpotifyLastPlayedData = await request.json();

	const { data, error } = await supabaseClient
		.from('spotifyLastPlayedTime')
		.update({ ...requestData })
		.eq('id', 1);

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json({ data }, { status: 200 });
}

export async function GET(): Promise<Response> {
	const { data, error } = await supabaseClient.from('spotifyLastPlayedTime').select().eq('id', 1);

	if (error) {
		return json({ error: error.message }, { status: 500, headers: corsHeaders });
	} else {
		return json(data, { status: 200, headers: corsHeaders });
	}
}
