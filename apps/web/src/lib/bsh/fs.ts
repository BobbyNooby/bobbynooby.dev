import type { DirNode, FsNode, Mount } from './types';

export function buildFs(mounts: Mount[]): DirNode {
	const root: DirNode = { type: 'dir', kids: {}, pane: 'about' };
	for (const m of mounts) {
		let d = root;
		for (const seg of m.path.split('/').filter(Boolean)) {
			d.kids[seg] ??= { type: 'dir', kids: {}, pane: m.pane };
			d = d.kids[seg] as DirNode;
		}
		if (m.gridCat) d.gridCat = m.gridCat;
		if (m.hidden) d.hidden = true;
		if (m.locked) d.locked = true;
		for (const f of m.files()) {
			d.kids[f.name] = { type: 'file', pane: m.pane, gridCat: m.gridCat, ...f };
		}
	}
	return root;
}

/** Hidden folders (.secrets) only show with ls -a or when completing a dot name. */
export const isHidden = (n: FsNode) => n.type === 'dir' && !!n.hidden;

const isLocked = (n: FsNode | null, trusted: boolean) =>
	!!(n && n.type === 'dir' && n.locked && !trusted);

export function resolve(
	root: DirNode,
	cwd: string[],
	path: string,
	trusted: boolean
): { node: FsNode | null; parts: string[]; locked: boolean } {
	const p = (path || '').trim();
	const parts = /^[~/]/.test(p) ? [] : cwd.slice();
	for (let seg of p.replace(/^~\/?/, '').replace(/^\//, '').split('/').filter(Boolean)) {
		seg = seg.toLowerCase();
		if (seg === '.') continue;
		if (seg === '..') parts.pop();
		else parts.push(seg);
	}
	let n: FsNode = root;
	for (const seg of parts) {
		const kid: string | undefined =
			n.type === 'dir' && !isLocked(n, trusted)
				? Object.keys(n.kids).find((x) => x.toLowerCase() === seg)
				: undefined;
		if (!kid) return { node: null, parts, locked: isLocked(n, trusted) };
		n = (n as DirNode).kids[kid];
	}
	return { node: n, parts, locked: false };
}

export function pathOf(parts: string[]): string {
	return '~' + (parts.length ? '/' + parts.join('/') : '');
}

export function treeText(
	dir: DirNode,
	trusted: boolean,
	showHidden = false,
	prefix = '',
	out: string[] = []
): string[] {
	const names = Object.keys(dir.kids).filter(
		(n) => showHidden || !(dir.kids[n].type === 'dir' && (dir.kids[n] as DirNode).hidden)
	);
	names.forEach((n, i) => {
		const last = i === names.length - 1;
		const kid = dir.kids[n];
		const shut = isLocked(kid, trusted);
		out.push(
			prefix +
				(last ? '└── ' : '├── ') +
				n +
				(kid.type === 'dir' ? '/' : '') +
				(shut ? '   (locked)' : '')
		);
		if (kid.type === 'dir' && !shut) {
			treeText(kid, trusted, showHidden, prefix + (last ? '    ' : '│   '), out);
		}
	});
	return out;
}
