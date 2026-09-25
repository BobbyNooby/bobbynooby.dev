import { db } from '$lib/db/mongo';
import type { Link } from '$lib/db/mongoTypes';
import { json } from '@sveltejs/kit';

export async function GET() {
	const linksCollection = db.collection<Link>('links');
	const links =
		(await linksCollection
			.find({}, { projection: { _id: 0 }, sort: { item_order: 1 } })
			.toArray()) || [];

	return json(links);
}
