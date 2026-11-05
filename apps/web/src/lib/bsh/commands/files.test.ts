import { describe, expect, it } from 'vitest';
import { record, textOf } from '../testing';

const last = (cmds: string[]) => textOf(record(cmds)).split('\n').slice(1);

describe('ls', () => {
	it('shows hidden folders with any flag that has an a in it', () => {
		const hidden = last(['ls -a']);
		expect(hidden.join('\n')).toContain('.secrets/');
		for (const flag of ['-al', '-la', '-A', '-lA', '--all']) {
			expect(last(['ls ' + flag]), flag).toEqual(hidden);
		}
		expect(last(['ls -l']).join('\n')).not.toContain('.secrets/');
	});
});

describe('cat', () => {
	it('ignores flags like -n', () => {
		expect(last(['cat -n about_me.txt'])).toEqual(last(['cat about_me.txt']));
		expect(last(['open -n links/github.txt'])).toEqual(last(['open links/github.txt']));
		expect(last(['cat -n'])).toEqual(['cat: which file?']);
	});

	it('refuses a file written like a folder', () => {
		expect(last(['cat about_me.txt/'])).toEqual(['cat: not a folder: about_me.txt/']);
		expect(last(['open links/github.txt/'])).toEqual(['open: not a folder: links/github.txt/']);
	});
});

describe('tree', () => {
	it('says a locked folder is locked, and counts as nosy', () => {
		const out = last(['tree .secrets']);
		expect(out[0]).toBe('tree: permission denied. the cat does not trust you yet.');
		expect(out[1]).toMatch(/^\+ achievement: Nosy {2}\[/);
		expect(last(['tree ~/.secrets/games.txt'])[0]).toBe(
			'tree: permission denied. the cat does not trust you yet.'
		);
	});

	it('still says not a folder for a missing one', () => {
		expect(last(['tree nope'])).toEqual(['tree: not a folder: nope']);
	});
});
