import { supabaseClient } from '$lib/supabase';
import type { Session } from '@auth/sveltekit';
import { json } from '@sveltejs/kit';

export async function verifySession(session: Session | null) {
	if (session == null) {
		return 'Error : You are not logged in.';
	}

	let sessionobj = (
		await supabaseClient.from('adminIds').select('*').eq('id', session?.user?.id).single()
	).data;
	if (sessionobj != null && sessionobj.admin == true) {
		return true;
	}
	return 'Error : You are not an admin.';
}
