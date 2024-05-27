import { supabaseClient } from '$lib/supabase';
import { generalParse } from '$lib/utils/generalParse';
import { listCommand } from './command_list';

export async function swapCommand(
	args: string[]
): Promise<{ isValid: boolean; history: string[] }> {
	try {
		const tableName = args[0];

		const listTable = await listCommand([tableName]);

		const searchColumn1 = args[1];
		const searchValue1 = generalParse(args[2]);
		const searchColumn2 = args[3];
		const searchValue2 = generalParse(args[4]);

		const { data: data1, error: error1 } = await supabaseClient
			.from(tableName)
			.select(searchColumn1)
			.eq(searchColumn1, searchValue1);

		if (error1) {
			return {
				isValid: false,
				history: [error1.message]
			};
		}

		const { data: data2, error: error2 } = await supabaseClient
			.from(tableName)
			.select(searchColumn2)
			.eq(searchColumn2, searchValue2);

		if (error2) {
			return {
				isValid: false,
				history: [error2.message]
			};
		}

		const [value1] = data1.map((entry) => entry[searchColumn1]);
		const [value2] = data2.map((entry) => entry[searchColumn2]);

		const { data: dataUpdate1, error: errorUpdate1 } = await supabaseClient
			.from(tableName)
			.update({ [searchColumn1]: value2 })
			.eq(searchColumn1, searchValue1);

		if (errorUpdate1) {
			return {
				isValid: false,
				history: [errorUpdate1.message]
			};
		}

		const { data: dataUpdate2, error: errorUpdate2 } = await supabaseClient
			.from(tableName)
			.update({ [searchColumn2]: value1 })
			.eq(searchColumn2, searchValue2);

		if (errorUpdate2) {
			return {
				isValid: false,
				history: [errorUpdate2.message]
			};
		}

		return {
			isValid: true,
			history: [
				`Swapped ${tableName} where ${searchColumn1} = ${searchValue1}'s ${searchColumn1} with ${searchColumn2} = ${searchValue2}'s ${searchColumn2} successfully`
			]
		};
	} catch (error) {
		return {
			isValid: false,
			history: [error.message]
		};
	}
}
