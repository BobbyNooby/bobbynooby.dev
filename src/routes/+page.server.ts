import { getSongData } from '$lib/spotifyUtils';
import { supabaseClient } from '$lib/supabase';
import { getSpotifyLastPlayedData } from '$lib/supabaseUtils';

export const load = async () => {
	const songData = await getSongData();
	const spotifyLastPlayedData = await getSpotifyLastPlayedData();

	return {
		songData,
		spotifyLastPlayedData
	};
};
