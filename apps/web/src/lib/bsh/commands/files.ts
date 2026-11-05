import { isHidden, pathOf, treeText } from '../fs';
import type { DirNode, FileNode, Line } from '../types';
import type { Command, CommandTable, ShellEnv } from './types';

function lsLine(env: ShellEnv, node: DirNode, parts: string[], all: boolean) {
	const names = Object.keys(node.kids).filter((n) => all || !isHidden(node.kids[n]));
	if (!names.length) return env.print('(empty)', '#9ca3af');
	const segs: Line = [];
	names.forEach((n, i) => {
		const abs = pathOf(parts.concat(n));
		segs.push(
			node.kids[n].type === 'dir'
				? { t: n + '/', c: '#60a5fa', run: 'cd ' + abs }
				: { t: n, c: '#f5f5f5', run: 'cat ' + abs }
		);
		if (i < names.length - 1) segs.push({ t: '  ' });
	});
	env.print(segs);
}

const ls: Command = (env, { args }) => {
	// -a, -al, -A, --all: any flag with an a shows hidden folders.
	const all = args.some((x) => x.startsWith('-') && /a/i.test(x));
	const target = args.filter((x) => !x.startsWith('-')).join(' ');
	const r = env.find(target);
	if (r.locked || env.locked(r.node)) {
		env.print('ls: permission denied. the cat does not trust you yet.', '#ef4444');
		return env.unlock('secret');
	}
	if (!r.node) return env.print('ls: no such file or folder: ' + target, '#ef4444');
	if (r.node.type === 'file') return env.print(target);
	return lsLine(env, r.node, r.parts, all);
};

const cd: Command = (env, { arg }) => {
	const r = env.find(arg || '~');
	if (r.locked || env.locked(r.node)) {
		env.print('bsh: permission denied. the cat is watching.', '#ef4444');
		return env.unlock('secret');
	}
	if (!r.node) return env.print('cd: no such folder: ' + arg, '#ef4444');
	if (r.node.type !== 'dir') return env.print('cd: not a folder: ' + arg + ' (try cat)', '#ef4444');
	env.st.cwd = r.parts;
	env.ctx.onPrompt('cd');
	return env.focusFor(r.node);
};

const tree: Command = (env, { arg }) => {
	const r = env.find(arg);
	if (r.locked || env.locked(r.node)) {
		env.print('tree: permission denied. the cat does not trust you yet.', '#ef4444');
		return env.unlock('secret');
	}
	if (!r.node || r.node.type !== 'dir') {
		return env.print('tree: not a folder: ' + (arg || '.'), '#ef4444');
	}
	env.print(pathOf(r.parts), '#60a5fa');
	for (const t of treeText(r.node, env.store.trusted())) {
		env.print(t, t.trim().endsWith('/') ? '#60a5fa' : '#d1d5db');
	}
	return env.unlock('tree');
};

// cat prints a file (and opens its window); open follows its link or opens its window.
const catOrOpen: Command = (env, { name: c, arg }) => {
	if (!arg) return env.print(c + ': which file?', '#ef4444');
	const r = env.find(arg);
	if (r.locked) {
		env.print(c + ': permission denied. the cat does not trust you yet.', '#ef4444');
		return env.unlock('secret');
	}
	if (!r.node) return env.print(c + ': no such file: ' + arg, '#ef4444');
	if (r.node.type === 'dir')
		return env.print(c + ': ' + arg + ' is a folder (try ls or cd)', '#ef4444');
	const file: FileNode = r.node;
	if (c === 'cat') {
		for (const l of file.lines()) env.print(l);
		env.focusFor(file);
		if (file.win) env.openWindow(file.win);
		return;
	}
	if (file.win) {
		env.focusFor(file);
		return env.openWindow(file.win);
	}
	if (file.href) {
		env.print([{ t: 'opening ' }, { t: file.href, href: file.href }]);
		return env.ctx.openLink(file.href);
	}
	return env.print('open: nothing to open in ' + arg + ' (try cat)', '#9ca3af');
};

export const fileCommands: CommandTable = {
	pwd: (env) => env.print(pathOf(env.st.cwd)),
	ls,
	cd,
	tree,
	cat: catOrOpen,
	open: catOrOpen
};
