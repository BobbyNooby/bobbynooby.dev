import { getSongData } from '$lib/spotifyUtils';
import { supabaseClient } from '$lib/supabase';
import { getSpotifyLastPlayedTime } from '$lib/supabaseUtils';

export const load = async () => {
	const songData = await getSongData();
	const spotifyLastPlayedTime = await getSpotifyLastPlayedTime();

	return {
		songData,
		spotifyLastPlayedTime
	};
};
