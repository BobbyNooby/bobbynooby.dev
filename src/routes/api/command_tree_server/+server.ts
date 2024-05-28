import { commandTree } from '$lib/commands/commandTree.js';
import { verifySession } from '$lib/utils/verifySession.js';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
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
