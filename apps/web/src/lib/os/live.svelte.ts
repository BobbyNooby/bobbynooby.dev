import type { discordStatuses } from '$lib/discord/discordTypes';
import type { SpotifyLastPlayedData } from '$lib/spotify/spotifyTypes';
import { errorLastPlayedSong } from '$lib/spotify/spotifyUtils';
import { startTwitchPolling } from '$lib/twitch/twitchLive.svelte';
import { createLiveSocket } from '$lib/utils/liveSocket';

// One socket per live source, shared by the bar, the panes and the shell.
export class LiveState {
	discord = $state<discordStatuses>('offline');
	song = $state<SpotifyLastPlayedData>(errorLastPlayedSong);
	hasSong = $state(false);
	now = $state(new Date());

	start(): () => void {
		const discord = createLiveSocket<{ status: discordStatuses }>('/discord', ({ status }) => {
			this.discord = status;
		});
		const spotify = createLiveSocket<{ song: SpotifyLastPlayedData }>('/spotify', ({ song }) => {
			this.song = song;
			this.hasSong = true;
		});
		const stopTwitch = startTwitchPolling();
		const clock = setInterval(() => (this.now = new Date()), 1000);
		return () => {
			discord.close();
			spotify.close();
			stopTwitch();
			clearInterval(clock);
		};
	}
}
