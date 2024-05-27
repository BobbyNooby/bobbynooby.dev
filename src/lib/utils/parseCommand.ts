export function parseCommand(command: string) {
	// I love you chatGPT
	const trimmedCommand = command.trim().replace(/\s+/g, ' ');
	const commandArray = [];
	let current = '';
	let insideQuotes = false;

	for (let i = 0; i < trimmedCommand.length; i++) {
		const char = trimmedCommand[i];

		if (char === '"' && !insideQuotes) {
			insideQuotes = true;
			current = '';
		} else if (char === '"' && insideQuotes) {
			insideQuotes = false;
			commandArray.push(current);
			current = '';
		} else if (char === ' ' && !insideQuotes) {
			if (current.length > 0) {
				commandArray.push(current);
				current = '';
			}
		} else {
			current += char;
		}
	}

	if (current.length > 0) {
		commandArray.push(current);
	}
	console.log(commandArray);

	return commandArray;
}
