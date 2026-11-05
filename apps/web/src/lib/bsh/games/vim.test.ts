import { describe, expect, it } from 'vitest';
import { textOf } from '../testing';
import { vimInput, vimSplash } from './vim';

describe('vimSplash', () => {
	it('draws the empty buffer in blue', () => {
		const lines = vimSplash();
		expect(textOf(lines).split('\n')).toEqual([
			'~',
			'~',
			'~        VIM - Vi IMproved (bsh edition)',
			'~        type  :q  and press Enter to exit',
			'~'
		]);
		expect(lines.every((l) => l[0].c === '#60a5fa')).toBe(true);
	});
});

describe('vimInput', () => {
	it('lets you out with any quit command', () => {
		for (const t of [':q', ':q!', ':wq', ':x', 'q', 'q!', 'wq', '  :q  ']) {
			expect(vimInput(t)).toEqual({
				lines: [[{ t: 'you escaped vim. most people never do.', c: '#4ade80' }]],
				quit: true
			});
		}
	});

	it('points the usual escape attempts at :q', () => {
		for (const t of ['exit', 'quit', 'help', 'esc', 'escape', 'ctrl+c', '^c', 'EXIT', ' Help ']) {
			expect(vimInput(t)).toEqual({
				lines: [[{ t: 'Type  :q  and press Enter to exit Vim', c: '#ef4444' }]],
				quit: false
			});
		}
	});

	it('nags about unsaved changes for anything else', () => {
		for (const t of ['', 'hello', ':Q', ': q', 'ZZ']) {
			expect(vimInput(t)).toEqual({
				lines: [[{ t: 'E37: No write since last change (add ! to override)', c: '#ef4444' }]],
				quit: false
			});
		}
	});
});
