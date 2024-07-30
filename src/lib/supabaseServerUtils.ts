import { supabaseClient } from './supabase';
import type { threeByThreeEntry } from './types/3x3/aniListMedia';
import type { chatMessageSchema } from './types/chatMessageSchema';
import type { linksSchema } from './types/linksSchema';
import type { projectsSchema } from './types/projectsSchema';
import type { threeByThreeServerData } from './types/threeByThreeTypes';

export async function getLinks(): Promise<linksSchema[]> {
	const { data, error } = await supabaseClient
		.from('links')
		.select('uid, name, href, color, item_order')
		.order('item_order', { ascending: true });

	if (error) {
		return [];
	} else {
		return data;
	}
}

export async function getProjects(): Promise<projectsSchema[]> {
	const { data, error } = await supabaseClient
		.from('projects')
		.select('uid, item_order, name, description, href')
		.order('item_order', { ascending: true });

	if (error) {
		return [];
	} else {
		return data;
	}
}

export async function getThreeByThreeData(category: string): Promise<threeByThreeEntry[]> {
	const { data, error } = await supabaseClient.from(category + '3x3').select('*');
	if (error) {
		return [];
	} else {
		return data;
	}
}

export async function getChatMessages(): Promise<chatMessageSchema[]> {
	const { data, error } = await supabaseClient
		.from('messages')
		.select()
		.order('created_at', { ascending: true });

	if (error) {
		return [];
	} else {
		return data;
	}
}

export async function getAll3x3Data(): Promise<threeByThreeServerData[]> {
	const { data, error } = await supabaseClient.from('3x3list').select('key');

	if (error) {
		return [];
	} else {
		const returnData = (await Promise.all(
			data.map(async (item) => {
				const label = item.key;
				const data = await getThreeByThreeData(label.toLowerCase());

				return { label: label, data: data };
			})
		)) as threeByThreeServerData[];

		return returnData;
	}
}
