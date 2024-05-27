import { supabaseClient } from '$lib/supabase.js';
import { getLinks, getProjects } from '$lib/supabaseServerUtils';
import type { linksSchema } from '$lib/types/linksSchema.js';
import type { projectsSchema } from '$lib/types/projectsSchema.js';
import { verifySession } from '$lib/utils/verifySession.js';
import { fail, json, type Actions } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	let session = await locals.auth();
	let validSession = await verifySession(session);
	if (validSession != true) {
		validSession = false;
	}

	const links = await getLinks();
	const projects = await getProjects();
	return { links, projects, isSessionValid: validSession };
};

export const actions = {
	update: async (event) => {
		let session = await event.locals.auth();
		console.log(session);
		let validSession = await verifySession(session);
		if (validSession != true) {
			return fail(403, { error: validSession });
		}

		const formData = await event.request.formData();
		const linksData = JSON.parse(formData.get('linksTable') as string) || [];
		const projectsData = JSON.parse(formData.get('projectsTable') as string) || [];

		const queryList = [
			{ table: 'links', data: linksData },
			{ table: 'projects', data: projectsData }
		];

		for (const query of queryList) {
			const { data, error } = await supabaseClient.from(query.table).upsert(query.data).select();

			if (error) {
				return fail(500, { error: error.message });
			}
		}
	}
};
