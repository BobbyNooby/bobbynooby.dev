import { safeHref } from '../format';
import { fileNames } from '../slug';
import type { BshData, BshMedia, Line, Mount } from '../types';

const anilistUrl = (cat: string, m: BshMedia) => 'https://anilist.co/' + cat + '/' + m.anilistId;

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

/** One folder per 3x3 list: 3x3/anime, 3x3/manga, … */
export function gridMounts(data: BshData): Mount[] {
	return Object.keys(data.threeByThree).map((cat) => ({
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
	}));
}
