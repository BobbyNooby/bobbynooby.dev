import { supabaseClient } from '$lib/supabase';

export const load = async () => {
	const { data, error } = await supabaseClient.from('3x3list').select('key');

	const serverData: { key: string }[] = data;

	const finalData = serverData.map((item) => {
		return item.key;
	});
	console.log(finalData);

	return {
		categories: finalData
	};
};
