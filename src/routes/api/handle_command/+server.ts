import { json } from '@sveltejs/kit';
import { parseCommand } from '$lib/utils/parseCommand.js';
import { commandTree } from '$lib/commands/commandTree.js';
import { verifySession } from '$lib/utils/verifySession.js';
import { argChecker } from '$lib/utils/argsChecker.js';

async function handleCommand(command: string): Promise<{ isValid: boolean; history: string[] }> {
	try {
		let response = {
			isValid: false,
			history: ['Error : Server Side']
		};

		const commandArray = parseCommand(command);
		const rootCommand = commandArray[0] as keyof typeof commandTree;
		const args = commandArray.slice(1);

		const argCheckResponse = argChecker(commandTree[rootCommand].args, args);
		if (argCheckResponse.isValid) {
			const commandResponse = await commandTree[rootCommand].function(args);
			return { isValid: true, history: [commandArray.join(' '), ...commandResponse.history] };
		} else {
			return { isValid: false, history: [commandArray.join(' '), ...argCheckResponse.history] };
		}
	} catch (error) {
		console.log(error);
		return {
			isValid: false,
			history: [parseCommand(command).join(' '), (error as Error).message]
		};
	}
}

export async function POST({ request, locals }) {
	try {
		const requestData = await request.json();
		let validSession = await verifySession(await locals.auth());

		if (validSession != true) {
			return json({ error: validSession }, { status: 403 });
		}

		const commandResponse = await handleCommand(requestData.command);
		return json(
			{ isValid: commandResponse.isValid, history: commandResponse.history },
			{ status: 200 }
		);
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
