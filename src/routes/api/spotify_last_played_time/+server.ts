import { supabaseClient } from '$lib/supabase.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }): Promise<Response> {
	const { time } = await request.json();

	console.log(time);
	const { data, error } = await supabaseClient
		.from('spotifyLastPlayedTime')
		.update({ time: time })
		.eq('id', 1);

	if (error) {
		console.log(error);
		return json({ error: error.message }, { status: 500 });
	}

	return json({ data }, { status: 200 });
}

export async function GET(): Promise<Response> {
	const { data, error } = await supabaseClient
		.from('spotifyLastPlayedTime')
		.select('time')
		.eq('id', 1);

	if (error) {
		return json({ error: error.message }, { status: 500 });
	} else {
		return json(data[0].time, { status: 200 });
	}
}
