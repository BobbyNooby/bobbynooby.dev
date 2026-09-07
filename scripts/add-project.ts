// Idempotent add of one project to the Mongo `projects` collection.
// Re-running is safe: upserts on title, keeps item_order stable if it exists.
import fs from 'node:fs';
import { MongoClient } from 'mongodb';

const NEW_PROJECT = {
	title: 'Better Event Quests',
	description:
		"A cleaner, filterable view of Monster Hunter Wilds' event quests — weekly Capcom scrape into SQLite, live countdowns, zero rate-limit anxiety.",
	href: 'https://github.com/BobbyNooby/BetterEventQuestsPageWilds'
};

const url = fs.readFileSync('.env', 'utf8').match(/MONGO_ADMIN_URL=(.*)/)[1].trim();
const client = new MongoClient(url);
await client.connect();

const projects = client.db().collection('projects');

const existing = await projects.findOne({ title: NEW_PROJECT.title });
const maxOrder = await projects
	.find({}, { projection: { item_order: 1 }, sort: { item_order: -1 }, limit: 1 })
	.toArray();
const nextOrder = (maxOrder[0]?.item_order ?? -1) + 1;
const maxUid = await projects
	.find({}, { projection: { uid: 1 }, sort: { uid: -1 }, limit: 1 })
	.toArray();
const nextUid = (maxUid[0]?.uid ?? 0) + 1;

const result = await projects.updateOne(
	{ title: NEW_PROJECT.title },
	{
		$setOnInsert: { ...NEW_PROJECT, uid: nextUid, item_order: nextOrder }
	},
	{ upsert: true }
);

console.log(
	result.upsertedId ? `inserted as item_order ${nextOrder}, uid ${nextUid}` : 'already exists — no change'
);

const all = await projects
	.find({}, { projection: { _id: 0 }, sort: { item_order: 1 } })
	.toArray();
console.log(`collection now has ${all.length} projects; last:`, JSON.stringify(all.at(-1)));

await client.close();
