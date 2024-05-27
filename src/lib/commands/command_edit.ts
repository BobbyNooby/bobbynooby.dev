import { supabaseClient } from '$lib/supabase';
import { generalParse } from '$lib/utils/generalParse';
import { listCommand } from './command_list';

export async function editCommand(
	args: string[]
): Promise<{ isValid: boolean; history: string[] }> {
	try {
		const tableName = args[0];

		const listTable = await listCommand([tableName]);

		const searchColumn = args[1];
		const searchValue = generalParse(args[2]);
		const setColumn = args[3];
		const setValue = generalParse(args[4]);

		const { data, error } = await supabaseClient
			.from(tableName)
			.update({ [setColumn]: setValue })
			.eq(searchColumn, searchValue);

		if (!listTable.isValid) {
			return {
				isValid: false,
				history: listTable.history
			};
		} else if (error) {
			return {
				isValid: false,
				history: [error.message]
			};
		}

		return {
			isValid: true,
			history: [
				`Updated ${tableName} where ${searchColumn} = ${searchValue}'s ${setColumn} to ${setValue} successfully`
			]
		};
	} catch (error) {
		return {
			isValid: false,
			history: [error.message]
		};
	}
}
