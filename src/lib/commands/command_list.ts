import { supabaseClient } from '$lib/supabase';
import { getSchema } from '$lib/utils/getSchema';

export async function listCommand(
	args: string[]
): Promise<{ isValid: boolean; history: string[] }> {
	try {
		const tableName = args[0];
		const { data, error } = await supabaseClient.from(tableName).select();

		if (error) {
			return { isValid: false, history: [`Table "${tableName}" does not exist`] };
		}

		let returnData: string[] = [];

		returnData.push(getSchema(data).join(' '));
		for (const entry of data) {
			let entryArray = [];
			for (const value of Object.values(entry) as any) {
				entryArray.push(value.toString());
			}
			returnData.push(entryArray.join(' '));
		}

		return {
			isValid: true,
			history: returnData
		};
	} catch (error) {
		return {
			isValid: false,
			history: [error.message]
		};
	}
}
