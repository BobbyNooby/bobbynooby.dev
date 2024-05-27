import { editCommand } from './command_edit';
import { listCommand } from './command_list';

export const commandTree: Record<
	string,
	{
		args: number;
		function: (
			args: string[]
		) => Promise<{ isValid: boolean; history: string[] }> | { isValid: boolean; history: string[] };
	}
> = {
	list: {
		args: 1,
		function: (args: string[]) => listCommand(args)
	},
	edit: {
		args: 5,
		function: (args: string[]) => editCommand(args)
	}
};

export const commandTreePublic = Object.keys(commandTree);
