import { db } from '$lib/db/mongo';
import { getAll3x3Data, getLinks, getProjects } from '$lib/db/mongoUtils.js';
import type { threeByThreeEntry } from '$lib/types.js';
import { verifySession } from '$lib/utils/verifySession.js';
import { fail, json, type Actions } from '@sveltejs/kit';

export const load = async ({ locals, fetch }) => {
	let session = await locals.auth();
	let validSession = await verifySession(session);
	if (validSession != true) {
		validSession = false;
	}

	const all3x3Data = await getAll3x3Data(fetch);

	const links = await getLinks(fetch);
	const projects = await getProjects(fetch);
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
			queryList.push({ table: '3x3_' + entry.label.toLowerCase(), data: entry.data });
		}

		for (const query of queryList) {
			const collection = db.collection(query.table);
			const oldData = await collection.find({}, { projection: { _id: 0 } }).toArray();
			try {
				await collection.deleteMany({});
				const result = await collection.insertMany(query.data, { ordered: false });
				if (!result.acknowledged) {
					throw new Error('Insert not acknowledged');
				}
			} catch (err) {
				if (oldData.length > 0) {
					await collection.deleteMany({});
					await collection.insertMany(oldData, { ordered: false });
				}
				return fail(500, { error: 'Failed to update data, changes rolled back' });
			}
		}
	}
};
