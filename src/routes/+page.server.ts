import { getLinks, getProjects } from '$lib/db/mongoUtils.js';
import type { Link, Project } from '$lib/db/mongoTypes.js';
import type { discordStatuses } from '$lib/discord/discordTypes.js';
import { getDiscordStatus } from '$lib/discord/discordUtils';
import type { SpotifyLastPlayedData, SpotifySongData } from '$lib/spotify/spotifyTypes.js';
import {
	errorLastPlayedSong,
	errorSong,
	getCurrentSongData,
	getLastPlayedSongData
} from '$lib/spotify/spotifyUtils';

export const load = async ({ locals, fetch }) => {
	let returnObject: {
		links: Link[];
		projects: Project[];
		discordStatus: discordStatuses;
		currentSongData: SpotifySongData;
		lastSongData: SpotifyLastPlayedData;
	} = {
		links: [],
		projects: [],
		discordStatus: 'unknown',
		currentSongData: errorSong,
		lastSongData: errorLastPlayedSong
	};

	returnObject.links = await getLinks(fetch);
	returnObject.projects = await getProjects(fetch);
	returnObject.discordStatus = await getDiscordStatus(fetch);
	returnObject.currentSongData = await getCurrentSongData(fetch);
	returnObject.lastSongData = await getLastPlayedSongData(fetch);

	return returnObject;
};
