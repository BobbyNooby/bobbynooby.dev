import { redirect } from '@sveltejs/kit';
import { signOut } from '../../auth';
import type { Actions, PageServerLoad } from './$types';

// Only the form action lives here; there is no page to show.
export const load: PageServerLoad = () => redirect(302, '/');
export const actions: Actions = { default: signOut };
