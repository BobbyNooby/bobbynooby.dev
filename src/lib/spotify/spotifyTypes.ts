export type SpotifySongData = {
	isPlaying: boolean;
	title: string;
	artist: string;
	album: string;
	albumImageUrl: string;
	songUrl: string;
};

export type SpotifyLastPlayedData = SpotifySongData & { playedAt: string };
