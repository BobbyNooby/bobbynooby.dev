import { db } from '$lib/db/mongo';
import type { Session } from '@auth/sveltekit';
import { json } from '@sveltejs/kit';

export async function verifySession(session: Session | null) {
	if (session == null) {
		return 'Error : You are not logged in.';
	}

	const userId = session?.user?.id;

	const adminDocument =
		(await db
			.collection<{ id: string; name: string; admin: boolean }>('admin_ids')
			.findOne({ id: userId })) || null;

	if (adminDocument != null && adminDocument.admin == true) {
		return true;
	}
	return 'Error : You are not an admin.';
}
