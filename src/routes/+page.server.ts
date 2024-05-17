export const load = async () => {
	const songData = await fetch('http://localhost:5173/api/spotify_now_playing', {
		method: 'GET'
	}).then((res) => res.json());

	return { songData };
};
