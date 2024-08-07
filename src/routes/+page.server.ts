import { getManga } from '$lib/anilist.js';
import { discordClient } from '$lib/discord.js';
import { getDiscordStatus, type discordStatuses } from '$lib/discordUtils';
import type { SpotifySongData } from '$lib/spotify.js';
import { getCurrentSongData, getLastPlayedSongData } from '$lib/spotifyUtils';
import { supabaseClient } from '$lib/supabase.js';
import { getChatMessages, getLinks, getProjects } from '$lib/supabaseServerUtils';
import type { SpotifyLastPlayedData } from '$lib/supabaseUtils.js';
import type { chatMessageSchema } from '$lib/types/chatMessageSchema.js';
import type { linksSchema } from '$lib/types/linksSchema.js';
import type { projectsSchema } from '$lib/types/projectsSchema.js';
import { verifySession } from '$lib/utils/verifySession.js';
import { fail } from '@sveltejs/kit';
import type { Channel } from 'discord.js';

const maxMessages = 500;
export const load = async ({ locals }) => {
	let session = await locals.auth();
	let validSession = await verifySession(session);

	if (validSession != true) {
		validSession = false;
	}
	const dateClass = new Date();

	let songData: SpotifySongData = await getCurrentSongData();
	const spotifyLastPlayedData: SpotifyLastPlayedData = await getLastPlayedSongData();
	const discordStatus: discordStatuses = await getDiscordStatus();
	const links: linksSchema[] = await getLinks();
	const projects: projectsSchema[] = await getProjects();
	const chatMessages: chatMessageSchema[] = [
		...(await getChatMessages()),
		{
			created_at: dateClass.toUTCString(),
			name: 'SYSTEM',
			message: 'Type /nick to change your username.',
			rank: 'system'
		}
	];

	// if (
	// 	Object.values(songData).some((value) => value === null || value === undefined) ||
	// 	songData.isPlaying === false
	// ) {
	// 	songData = { isPlaying: false, ...spotifyLastPlayedData };
	// }

	return {
		songData,
		spotifyLastPlayedData,
		discordStatus,
		links,
		projects,
		isSessionValid: validSession,
		chatMessages
	};
};

export const actions = {
	sendMessage: async (event) => {
		try {
			const formData = await event.request.formData();
			const messageData = JSON.parse(formData.get('messageData') as string);

			if (messageData.name && messageData.message) {
				let messageRank = 'guest';

				let submitName = messageData.name;
				let submitMessage = messageData.message;

				const session = await event.locals.auth();
				const validSession = await verifySession(session);
				if (validSession == true) {
					messageRank = 'owner';
				}

				const { count, error } = await supabaseClient
					.from('messages')
					.select('*', { count: 'exact' });

				if ((count || 0) > 500) {
					const oldestMessage = await supabaseClient
						.from('messages')
						.select('created_at')
						.order('created_at', { ascending: true })
						.limit(1);

					if (oldestMessage.error) {
						return fail(500, { error: 'Error getting oldest message' });
					}

					const deleteQuery = await supabaseClient
						.from('messages')
						.delete()
						.eq('created_at', oldestMessage.data[0].created_at);

					if (deleteQuery.error) {
						return fail(500, { error: 'Error deleting oldest message' });
					}
				}

				const { status } = await supabaseClient
					.from('messages')
					.insert([{ name: submitName, message: submitMessage, rank: messageRank }]);

				const discordChannel = discordClient.channels.cache.get('1245764750613151785') as Channel;
				if (discordChannel) {
					let nameString = messageData.name;
					if (messageRank === 'owner') {
						nameString = `:crown:${messageData.name}`;
					}

					discordChannel.send(`**${nameString}**: ${messageData.message}`);
				}

				if (status !== 201 || error) {
					return fail(500, { error: error.message });
				}
			} else {
				return fail(500, { error: 'Name and message are required' });
			}
		} catch (error) {
			return fail(500, { error: error.message });
		}
	}
};
