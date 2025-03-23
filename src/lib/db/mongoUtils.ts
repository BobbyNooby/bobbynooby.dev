import type { threeByThreeServerData } from '$lib/types';
import { db } from './mongo';
import type { Link, Project } from './mongoTypes';

export async function getLinks(fetch: typeof globalThis.fetch = globalThis.fetch): Promise<Link[]> {
	const res = await fetch('/api/links', { method: 'GET' });
	const data = await res.json();
	return data || [];
}

export async function getProjects(
	fetch: typeof globalThis.fetch = globalThis.fetch
): Promise<Project[]> {
	const res = await fetch('/api/projects', { method: 'GET' });
	const data = await res.json();
	return data || [];
}

export async function getAll3x3Data(
	fetch: typeof globalThis.fetch = globalThis.fetch
): Promise<threeByThreeServerData[]> {
	const routeDoc = await db
		.collection<{ routes: string[] }>('3x3_dynamic_routes')
		.findOne({}, { projection: { _id: 0, routes: 1 } });
	const routes = routeDoc ? routeDoc.routes : [];

	const returnData = await Promise.all(
		routes.map(async (route) => {
			const data = await db
				.collection('3x3_' + route.toLowerCase())
				.find({}, { projection: { _id: 0 } })
				.toArray();
			return { label: route, data: data };
		})
	);

	return returnData;
}
