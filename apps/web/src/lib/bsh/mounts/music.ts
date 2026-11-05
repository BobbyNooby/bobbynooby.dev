import { ago, safeHref } from '../format';
import type { BshData, Line, Mount } from '../types';
import type { MountEnv } from './types';

const PLAYLIST = 'https://open.spotify.com/playlist/4XMKgF2w5YScCmVCaODvlC';

export function musicMount(data: BshData, env: MountEnv): Mount {
	const lp = data.lastPlayed;
	return {
		path: 'music',
		pane: 'music',
		files: () => [
			...(lp
				? [
						{
							name: 'last_played.txt',
							href: safeHref(lp.songUrl),
							lines: (): Line[] => {
								const playing = env.live().playing;
								return [
									[
										{
											t: playing
												? '< Now Playing >'
												: '! Last Played ' + ago(lp.playedAt, env.now()) + ' !',
											c: playing ? '#4ade80' : '#9ca3af'
										}
									],
									[{ t: lp.title + ' — ' + lp.artist }],
									[{ t: 'from ' + lp.album, c: '#9ca3af' }],
									[{ t: 'track  ' }, { t: lp.songUrl, href: safeHref(lp.songUrl) }]
								];
							}
						}
					]
				: []),
			{
				name: 'playlist.txt',
				href: PLAYLIST,
				lines: () => [
					[
						{ t: 'recommended playlist  ' },
						{ t: 'open.spotify.com/playlist/4XMKgF2w5YScCmVCaODvlC', href: PLAYLIST }
					]
				]
			}
		]
	};
}
