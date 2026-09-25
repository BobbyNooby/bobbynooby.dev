import { db } from '$lib/db/mongo';
import { errorLastPlayedSong } from '$lib/spotify/spotifyUtils';
import { corsHeaders } from '$lib/utils/corsHeaders';
import { json } from '@sveltejs/kit';

export async function GET({ request }: { request: Request }) {
	const cors = corsHeaders(request.headers.get('origin'));
	const lastPlayed = await db.collection('recently_played').findOne({});

	if (!lastPlayed) return json({ data: errorLastPlayedSong }, { status: 404, headers: cors });

	return json({ data: lastPlayed, success: true }, { status: 200, headers: cors });
}
