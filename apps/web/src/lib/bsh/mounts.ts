import { ago, bar, fmtHours, playedDate, safeHref } from './format';
import { fileNames } from './slug';
import type { BshData, BshGame, BshMedia, Line, LiveStatus, Mount } from './types';

type MountEnv = { live: () => LiveStatus; now: () => Date; timeZone?: string };

const DISCORD = { online: '#23A55A', idle: '#F0B232', dnd: '#F23F43', offline: '#80848E' };
const PLAYLIST = 'https://open.spotify.com/playlist/4XMKgF2w5YScCmVCaODvlC';
export const HIDDEN_COMMANDS = [
	'snake',
	'hunt',
	'trivia',
	'gacha',
	'fortune',
	'catsay hi',
	'nmap',
	'sl',
	'vim'
];

const anilistUrl = (cat: string, m: BshMedia) => 'https://anilist.co/' + cat + '/' + m.anilistId;

function gameLines(g: BshGame, timeZone?: string): Line[] {
	const a = g.achievements && g.achievements.total ? g.achievements : null;
	const out: Line[] = [
		[{ t: g.name, c: '#1b9be8' }],
		[{ t: 'hours         ' }, { t: fmtHours(g.hours), c: '#facc15' }]
	];
	if (g.lastPlayed) out.push([{ t: 'last played   ' + playedDate(g.lastPlayed, timeZone) }]);
	if (g.releaseDate) out.push([{ t: 'released      ' + g.releaseDate }]);
	if (g.genres && g.genres.length) {
		out.push([
			{ t: 'genres        ' + g.genres.map((x) => '[' + x.toUpperCase() + ']').join(' ') }
		]);
	}
	out.push(
		a
			? [
					{ t: 'achievements  ' },
					{ t: '[' + bar(a.unlocked, a.total, 18) + ']', c: '#00ff00' },
					{ t: ' ' + a.unlocked + '/' + a.total }
				]
			: [{ t: 'achievements  no data', c: '#9ca3af' }]
	);
	return out;
}

function mediaLines(m: BshMedia, cat: string, i: number): Line[] {
	const url = anilistUrl(cat, m);
	return [
		[{ t: m.label, c: m.color || '#f5f5f5' }],
		[{ t: 'title     ' + (m.title || m.label) }],
		[{ t: 'grid      /3x3/' + cat + ' #' + (i + 1) }],
		[{ t: 'review    ' + (m.review || 'none yet'), c: m.review ? '#f5f5f5' : '#9ca3af' }],
		[{ t: 'anilist   ' }, { t: url, href: safeHref(url) }]
	];
}

// One mount per folder, in the order ls shows them. Lines are built when a
// file is read, so status files always show the value right now.
export function createMounts(data: BshData, env: MountEnv): Mount[] {
	const lp = data.lastPlayed;
	const projectNames = fileNames(
		data.projects.map((p) => p.title),
		'projects',
		'.txt'
	);
	const linkNames = fileNames(
		data.links.map((l) => l.label),
		'links',
		'.txt'
	);
	const gameNames = fileNames(
		data.games.map((g) => g.name),
		'games',
		'.txt'
	);

	return [
		{
			path: '',
			pane: 'about',
			files: () => [
				{
					name: 'about_me.txt',
					lines: () => [
						[{ t: 'Welcome to my small corner of the internet!', c: '#facc15' }],
						[
							{
								t: 'This site is my { blog / status / portfolio }, mostly to show off what I { have been / am currently } up to.'
							}
						],
						[
							{
								t: 'Main languages: JavaScript / TypeScript / English. Favourite framework: Svelte.'
							}
						],
						[
							{ t: 'Find me in ' },
							{ t: 'links/', c: '#60a5fa', run: 'ls ~/links' },
							{ t: ', or say hi with ' },
							{ t: 'say <msg>', c: '#4ade80' }
						]
					]
				}
			]
		},
		{
			path: 'projects',
			pane: 'projects',
			files: () =>
				data.projects.map((p, i) => {
					const href = safeHref(p.href);
					return {
						name: projectNames[i],
						href,
						lines: () => [
							[{ t: p.title, c: '#facc15' }],
							[{ t: p.description }],
							[{ t: 'link  ' }, { t: p.href, href }]
						]
					};
				})
		},
		{
			path: 'links',
			pane: 'links',
			files: () =>
				data.links.map((l, i) => {
					const href = safeHref(l.href);
					return {
						name: linkNames[i],
						href,
						lines: () => [[{ t: '/' + l.label, c: l.color }, { t: '  →  ' }, { t: l.href, href }]]
					};
				})
		},
		{
			path: 'games',
			pane: 'games',
			files: () =>
				data.games.map((g, i) => ({
					name: gameNames[i],
					win: { kind: 'game' as const, game: g },
					lines: () => gameLines(g, env.timeZone)
				}))
		},
		...Object.keys(data.threeByThree).map(
			(cat): Mount => ({
				path: '3x3/' + cat,
				pane: 'grid',
				gridCat: cat,
				files: () => {
					const rows = data.threeByThree[cat];
					const names = fileNames(
						rows.map((m) => m.label),
						cat,
						'.txt'
					);
					return rows.map((m, i) => ({
						name: names[i],
						href: safeHref(anilistUrl(cat, m)),
						win: { kind: 'media' as const, media: m, category: cat, index: i },
						lines: () => mediaLines(m, cat, i)
					}));
				}
			})
		),
		{
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
		},
		{
			path: 'status',
			pane: 'status',
			files: () => [
				{
					name: 'discord.txt',
					lines: () => {
						const { discord } = env.live();
						return [[{ t: discord + '.sh', c: DISCORD[discord] }]];
					}
				},
				{
					name: 'twitch.txt',
					lines: () => {
						const live = env.live().twitchLive;
						return [[{ t: live ? 'live' : 'offline', c: live ? '#a970ff' : '#9ca3af' }]];
					}
				},
				{
					name: 'time.txt',
					lines: () => {
						const now = env.now();
						return [
							[{ t: 'UK  ' + now.toLocaleString('en-GB', { timeZone: 'Europe/London' }) }],
							[{ t: 'MY  ' + now.toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' }) }]
						];
					}
				}
			]
		},
		{
			path: 'chat',
			pane: 'chat',
			files: () => [
				{
					name: 'README.txt',
					lines: () => [
						[
							{ t: 'This room is live. ' },
							{ t: 'say <msg>', c: '#4ade80' },
							{ t: ' to talk, ' },
							{ t: 'username <name>', c: '#4ade80' },
							{ t: ' to rename (in the chat box it is /username).' }
						]
					]
				}
			]
		},
		{ path: 'blog', pane: 'about', files: () => [] },
		{
			path: '.secrets',
			pane: 'about',
			hidden: true,
			locked: true,
			files: () => [
				{
					name: 'games.txt',
					lines: () => [
						[{ t: 'commands that are not in help:', c: '#f472b6' }],
						HIDDEN_COMMANDS.flatMap((c, i) => [
							...(i ? [{ t: '  ' }] : []),
							{ t: c, c: '#4ade80', run: c }
						]),
						[{ t: 'also try: sudo (a few times), rm -rf /, exit (3 times), coffee', c: '#9ca3af' }],
						[{ t: '↑ ↑ ↓ ↓ ← → ← → B A   (on a phone, tap the title 7 times)', c: '#facc15' }]
					]
				},
				{
					name: 'credits.txt',
					lines: () => [
						[
							{ t: 'built by bobby. inspired by ' },
							{ t: 'dimden.dev', href: 'https://dimden.dev' },
							{ t: '. shell: bsh 0.1.' }
						]
					]
				}
			]
		}
	];
}
