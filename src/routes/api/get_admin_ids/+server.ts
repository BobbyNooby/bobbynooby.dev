import { supabaseClient } from '$lib/supabase';
import { json } from '@sveltejs/kit';
import { corsHeaders } from '$lib/corsHeaders';

export async function GET({ request }) {
	// const { data, error } = await supabaseClient.from('adminIds').select();
	// if (error) {
	// 	return json({ error: error.message }, { status: 500, headers: corsHeaders });
	// } else {
	// 	return json(data, { status: 200, headers: corsHeaders });
	// }
	//wip
}
