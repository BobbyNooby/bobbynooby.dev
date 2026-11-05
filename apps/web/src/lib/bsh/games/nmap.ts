import { safeHref } from '../format';
import { slug } from '../slug';
import type { BshProject, Line } from '../types';

export function nmap(target: string, projects: BshProject[]): Line[] {
	const lines: Line[] = [
		[{ t: 'agamoto-lite 0.0.1 · a joke, not a scan', c: '#9ca3af' }],
		[{ t: 'report for ' + (target || 'bobbynooby.dev') }],
		[{ t: 'PORT       STATE   SERVICE', c: '#facc15' }],
		[{ t: '80/tcp     open    http    → sends you to 443' }],
		[{ t: '443/tcp    open    https   → you are here' }],
		[{ t: '1337/tcp   honk    goose' }],
		[{ t: 'CVE context: none. it is a personal website.', c: '#9ca3af' }],
		[{ t: 'LLM recommendation: say hi in /Chat instead.', c: '#4ade80' }]
	];
	const ag = projects.find((p) => slug(p.title) === 'agamoto');
	if (ag) lines.push([{ t: 'the real tool: ' }, { t: ag.href, href: safeHref(ag.href) }]);
	return lines;
}
