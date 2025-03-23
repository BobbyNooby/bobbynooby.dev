import { db } from '$lib/db/mongo';

export const load = async () => {
	const data = await db.collection('3x3_dynamic_routes').findOne({}, { projection: { _id: 0 } });

	if (!data) return { routes: [] };
	return {
		routes: data.routes || []
	};
};
