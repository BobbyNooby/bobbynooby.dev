import { getDiscordStatus } from '$lib/discordUtils';
import { getCurrentSongData, getLastPlayedSongData } from '$lib/spotifyUtils';
import { getLinks, getProjects } from '$lib/supabaseServerUtils';
import { verifySession } from '$lib/utils/verifySession.js';

export const load = async ({ locals }) => {
	let session = await locals.auth();
	let validSession = await verifySession(session);

	if (validSession != true) {
		validSession = false;
	}

	let songData = await getCurrentSongData();
	const spotifyLastPlayedData = await getLastPlayedSongData();
	const discordStatus = await getDiscordStatus();
	const links = await getLinks();
	const projects = await getProjects();

	if (
		Object.values(songData).some((value) => value === null || value === undefined) ||
		songData.isPlaying === false
	) {
		songData = { isPlaying: false, ...spotifyLastPlayedData };
	}

	return {
		songData,
		spotifyLastPlayedData,
		discordStatus,
		links,
		projects,
		isSessionValid: validSession
	};
};
