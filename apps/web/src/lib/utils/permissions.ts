import { db } from '$lib/db/mongo';
import type { Session } from '@auth/sveltekit';

export type Permissions = {
	isAdmin: boolean;
	canShorten: boolean;
};

const noPermissions: Permissions = { isAdmin: false, canShorten: false };

/**
 * Resolves the visitor's permissions from the admin_ids collection.
 * Fails closed: any error or missing session means no permissions.
 */
export async function resolvePermissions(session: Session | null): Promise<Permissions> {
	const userId = session?.user?.id;
	if (!userId) {
		return noPermissions;
	}

	try {
		// A document without the admin flag may still use the URL shortener.
		const document = await db.collection<{ admin?: boolean }>('admin_ids').findOne({ id: userId });
		return { isAdmin: document?.admin === true, canShorten: document != null };
	} catch (err) {
		console.error('Failed to resolve permissions:', err);
		return noPermissions;
	}
}
