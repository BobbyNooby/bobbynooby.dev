import { getDiscordStatus } from '$lib/discordUtils';
import { getCurrentSongData, getLastPlayedSongData } from '$lib/spotifyUtils';

export const load = async () => {
	let songData = await getCurrentSongData();
	const spotifyLastPlayedData = await getLastPlayedSongData();
	const discordStatus = await getDiscordStatus();

	if (Object.values(songData).includes(undefined)) {
		songData = { isPlaying: false, ...spotifyLastPlayedData };
	}

	return {
		songData,
		spotifyLastPlayedData,
		discordStatus
	};
};
