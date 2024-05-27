import { commandTree } from '$lib/commands/commandTree.js';
import { verifySession } from '$lib/utils/verifySession.js';
import { error, json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	const requestData = await request.json();
	let validSession = await verifySession(await locals.auth());

	if (validSession != true) {
		return json({ error: validSession }, { status: 403 });
	}

	let returnCommandTree: Record<string, { args: number }> = {};

	for (const key in commandTree) {
		returnCommandTree[key] = { args: commandTree[key].args };
	}

	return json({ data: returnCommandTree }, { status: 200 });
}
