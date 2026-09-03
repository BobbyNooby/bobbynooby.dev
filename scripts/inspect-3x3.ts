// One-off read-only inspection of the 3x3 collections' real row shapes.
import fs from 'node:fs';
import { MongoClient } from 'mongodb';

const url = fs.readFileSync('.env', 'utf8').match(/MONGO_ADMIN_URL=(.*)/)[1].trim();
const client = new MongoClient(url);
await client.connect();

const routesDoc = await client
	.db()
	.collection('3x3_dynamic_routes')
	.findOne({}, { projection: { _id: 0, routes: 1 } });
console.log('routes:', JSON.stringify(routesDoc?.routes));

for (const route of routesDoc?.routes ?? []) {
	const coll = client.db().collection('3x3_' + route.toLowerCase());
	const rows = await coll.find({}).toArray();
	console.log(`\n== 3x3_${route.toLowerCase()} (${rows.length} rows)`);
	for (const [i, row] of rows.entries()) {
		const shape = Object.fromEntries(
			Object.entries(row).map(([k, v]) => [k, v === null ? 'null' : typeof v])
		);
		console.log(`  row${i}: ${JSON.stringify(shape)}`);
	}
}

await client.close();
