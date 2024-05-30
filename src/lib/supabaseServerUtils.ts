import { supabaseClient } from './supabase';
import type { chatMessageSchema } from './types/chatMessageSchema';
import type { linksSchema } from './types/linksSchema';
import type { projectsSchema } from './types/projectsSchema';

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
