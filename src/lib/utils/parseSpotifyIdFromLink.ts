export function parseSpotifyIdFromLink(link: string): string | null {
	if (link.startsWith('https://open.spotify.com/track/')) {
		return link.split('/').slice(-1)[0];
	}
	return null;
}
