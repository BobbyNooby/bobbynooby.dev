import { bar, fmtHours, playedDate } from '../format';
import { fileNames } from '../slug';
import type { BshData, BshGame, Line, Mount } from '../types';
import type { MountEnv } from './types';

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

export function gamesMount(data: BshData, env: MountEnv): Mount {
	const names = fileNames(
		data.games.map((g) => g.name),
		'games',
		'.txt'
	);
	return {
		path: 'games',
		pane: 'games',
		files: () =>
			data.games.map((g, i) => ({
				name: names[i],
				win: { kind: 'game' as const, game: g },
				lines: () => gameLines(g, env.timeZone)
			}))
	};
}
