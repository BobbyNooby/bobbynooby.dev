export function fmtHours(h: number): string {
	return h.toLocaleString('en-US') + 'h';
}

export function bar(done: number, total: number, cells: number): string {
	const filled = Math.round((done / total) * cells);
	return '█'.repeat(filled) + '░'.repeat(cells - filled);
}

export function ago(iso: string, now: Date): string {
	const s = (now.getTime() - new Date(iso).getTime()) / 1000;
	if (!isFinite(s)) return '';
	if (s < 60) return 'just now';
	if (s < 3600) return Math.floor(s / 60) + 'm ago';
	if (s < 86400) return Math.floor(s / 3600) + 'h ago';
	return Math.floor(s / 86400) + 'd ago';
}

export function playedDate(epochSec: number, timeZone?: string): string {
	return new Date(epochSec * 1000).toLocaleDateString('en-US', { dateStyle: 'medium', timeZone });
}

// Links and projects are admin-edited, but shell output must never carry a
// javascript: or data: link.
export function safeHref(href: string | null | undefined): string | undefined {
	if (!href) return undefined;
	try {
		const { protocol } = new URL(href);
		return protocol === 'http:' || protocol === 'https:' ? href : undefined;
	} catch {
		return undefined;
	}
}
