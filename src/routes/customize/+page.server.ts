import { supabaseClient } from '$lib/supabase.js';
import { getAll3x3Data, getLinks, getProjects } from '$lib/supabaseServerUtils';
import type { threeByThreeEntry } from '$lib/types/3x3/aniListMedia.js';
import type { linksSchema } from '$lib/types/linksSchema.js';
import type { projectsSchema } from '$lib/types/projectsSchema.js';
import type { threeByThreeServerData } from '$lib/types/threeByThreeTypes.js';
import { verifySession } from '$lib/utils/verifySession.js';
import { fail, json, type Actions } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	let session = await locals.auth();
	let validSession = await verifySession(session);
	if (validSession != true) {
		validSession = false;
	}

	const all3x3Data = await getAll3x3Data();

	const links = await getLinks();
	const projects = await getProjects();
	return { links, projects, isSessionValid: validSession, all3x3Data };
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
		const all3x3Data: { label: string; data: threeByThreeEntry[]; visible: boolean }[] =
			JSON.parse(formData.get('all3x3Data') as string) || [];

		let queryList = [
			{ table: 'links', data: linksData },
			{ table: 'projects', data: projectsData }
		];

		for (const entry of all3x3Data) {
			queryList.push({ table: entry.label.toLowerCase() + '3x3', data: entry.data });
		}

		for (const query of queryList) {
			const { data, error } = await supabaseClient.from(query.table).upsert(query.data).select();

			if (error) {
				return fail(500, { error: error.message });
			}
		}
	}
};
