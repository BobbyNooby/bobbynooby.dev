import { db } from '$lib/db/mongo';
import { type Project } from '$lib/db/mongoTypes';
import { json } from '@sveltejs/kit';

export async function GET() {
	const projectsCollection = db.collection<Project>('projects');
	const projects =
		(await projectsCollection
			.find({}, { projection: { _id: 0 }, sort: { item_order: 1 } })
			.toArray()) || [];

	return json(projects);
}
