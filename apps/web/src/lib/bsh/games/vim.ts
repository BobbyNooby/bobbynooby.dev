import type { Line } from '../types';

const QUITS = [':q', ':q!', ':wq', ':x', 'q', 'q!', 'wq'];
const ESCAPES = ['exit', 'quit', 'help', 'esc', 'escape', 'ctrl+c', '^c'];

const line = (t: string, c: string): Line => [{ t, c }];

export function vimSplash(): Line[] {
	return [
		'~',
		'~',
		'~        VIM - Vi IMproved (bsh edition)',
		'~        type  :q  and press Enter to exit',
		'~'
	].map((t) => line(t, '#60a5fa'));
}

export function vimInput(input: string): { lines: Line[]; quit: boolean } {
	const t = input.trim();
	if (QUITS.includes(t)) {
		return { lines: [line('you escaped vim. most people never do.', '#4ade80')], quit: true };
	}
	if (ESCAPES.includes(t.toLowerCase())) {
		return { lines: [line('Type  :q  and press Enter to exit Vim', '#ef4444')], quit: false };
	}
	return {
		lines: [line('E37: No write since last change (add ! to override)', '#ef4444')],
		quit: false
	};
}
