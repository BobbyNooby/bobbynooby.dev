import type { threeByThreeEntry, threeByThreeServerData } from '$lib/types';
import { db } from './mongo';
import type { Link, Project } from './mongoTypes';

export async function getLinks(): Promise<Link[]> {
	return db
		.collection<Link>('links')
		.find({}, { projection: { _id: 0 }, sort: { item_order: 1 } })
		.toArray();
}

export async function getProjects(): Promise<Project[]> {
	return db
		.collection<Project>('projects')
		.find({}, { projection: { _id: 0 }, sort: { item_order: 1 } })
		.toArray();
}

export async function getAll3x3Data(): Promise<threeByThreeServerData[]> {
	const routeDoc = await db
		.collection<{ routes: string[] }>('3x3_dynamic_routes')
		.findOne({}, { projection: { _id: 0, routes: 1 } });
	const routes = routeDoc?.routes ?? [];

	return Promise.all(
		routes.map(async (route) => {
			const data = await db
				.collection<threeByThreeEntry>('3x3_' + route.toLowerCase())
				.find({}, { projection: { _id: 0 }, sort: { item_order: 1 } })
				.toArray();
			// Documents saved before rows had uids get positional ones.
			const entries = data.map((entry, index) => ({ ...entry, uid: entry.uid ?? index }));
			return { label: route, data: entries };
		})
	);
}
