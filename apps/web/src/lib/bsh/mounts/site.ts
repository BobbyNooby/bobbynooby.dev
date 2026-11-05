import { safeHref } from '../format';
import { fileNames } from '../slug';
import type { BshData, Mount } from '../types';

export function projectsMount(data: BshData): Mount {
	const names = fileNames(
		data.projects.map((p) => p.title),
		'projects',
		'.txt'
	);
	return {
		path: 'projects',
		pane: 'projects',
		files: () =>
			data.projects.map((p, i) => {
				const href = safeHref(p.href);
				return {
					name: names[i],
					href,
					lines: () => [
						[{ t: p.title, c: '#facc15' }],
						[{ t: p.description }],
						[{ t: 'link  ' }, { t: p.href, href }]
					]
				};
			})
	};
}

export function linksMount(data: BshData): Mount {
	const names = fileNames(
		data.links.map((l) => l.label),
		'links',
		'.txt'
	);
	return {
		path: 'links',
		pane: 'links',
		files: () =>
			data.links.map((l, i) => {
				const href = safeHref(l.href);
				return {
					name: names[i],
					href,
					lines: () => [[{ t: '/' + l.label, c: l.color }, { t: '  →  ' }, { t: l.href, href }]]
				};
			})
	};
}
