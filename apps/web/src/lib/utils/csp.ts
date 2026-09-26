// Baseline CSP: allows inline scripts/styles (SvelteKit hydration), remote
// images/media, websocket connections, and the Spotify/Twitch embeds only.
export const csp = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://fonts.cdnfonts.com",
	'font-src https://fonts.gstatic.com https://cdn.jsdelivr.net https://fonts.cdnfonts.com',
	"img-src 'self' https:",
	"media-src 'self' https:",
	"connect-src 'self' wss:",
	'frame-src https://open.spotify.com https://player.twitch.tv'
].join('; ');
