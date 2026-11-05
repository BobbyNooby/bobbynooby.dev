import { CHAT_MAX_MESSAGE_LENGTH } from '@bobbynooby/shared';
import { describe, expect, it } from 'vitest';
import { ACH, createAchievementStore } from './achievements';
import { createShell } from './engine';
import { bar } from './format';
import goldenJson from './fixtures/golden.json';
import {
	fixture,
	liveShell,
	memoryStorage,
	record,
	runOn,
	textOf,
	type GoldenCase
} from './testing';
import type { BshData } from './types';

const golden = goldenJson as unknown as Record<'samples' | 'outputs' | 'eggs', GoldenCase[]>;
const emptyData: BshData = {
	links: [],
	projects: [],
	games: [],
	lastPlayed: null,
	threeByThree: {}
};

describe.each(['samples', 'outputs', 'eggs'] as const)('%s match the prototype', (group) => {
	it.each(golden[group].map((c) => [c.id, c] as const))('%s', (_id, c) => {
		expect(record(c.cmds, c)).toEqual(c.lines);
	});
});

describe('createShell', () => {
	it('counts achievements from ACH.length', () => {
		const text = record(['achievements']).map((l) => l.map((s) => s.t).join(''));
		expect(text[1]).toBe('achievements 1/' + ACH.length + '  [' + bar(1, ACH.length, 20) + ']');
	});

	it('treats messy typing like the clean form', () => {
		expect(record(['CD PROJECTS/', 'pwd']).at(-1)).toEqual([{ t: '~/projects' }]);
		const inProjects = { pre: ['cd projects'] };
		expect(record(['cat ./AGAMOTO.TXT'], inProjects).slice(1)).toEqual(
			record(['cat agamoto.txt'], inProjects).slice(1)
		);
		expect(record(['cd ~/3x3/manga/..', 'pwd']).at(-1)).toEqual([{ t: '~/3x3' }]);
		expect(record(['  ls    -a  ']).slice(1)).toEqual(record(['ls -a']).slice(1));
	});

	it('fills in what several Tab matches share, and lists them', () => {
		const { shell, lines } = liveShell();
		expect(shell.complete('cat games/mon')).toBe('cat games/monster-hunter-');
		expect(textOf(lines()).split('\n').at(-1)).toBe(
			'monster-hunter-world.txt  monster-hunter-wilds.txt  monster-hunter-rise.txt'
		);
		expect(shell.complete('cat links/TW')).toBe('cat links/twit');
		expect(shell.complete('cat links/s')).toBe('cat links/s');
	});

	it('does not Tab-complete folder names in the command slot', () => {
		const { shell, lines } = liveShell();
		const before = lines().length;
		expect(shell.complete('pro')).toBe('pro');
		expect(shell.complete('  m')).toBe('  m');
		expect(lines().length).toBe(before);
		expect(shell.complete('cd pro')).toBe('cd projects/');
	});

	it('prints (empty) for a mount with no data', () => {
		expect(textOf(runOn(emptyData, ['ls games']))).toContain('(empty)');
	});

	it('refuses to open an unsafe href', () => {
		const data = {
			...emptyData,
			projects: [{ title: 'x', description: 'd', href: 'javascript:alert(1)' }]
		};
		expect(textOf(runOn(data, ['open projects/x.txt']))).toContain(
			'open: nothing to open in projects/x.txt (try cat)'
		);
	});

	it('restores trust and achievements from the store', () => {
		const mem = memoryStorage({ 'bsh:honks': '10', 'bsh:ach': '["honk","trusted"]' });
		expect(textOf(runOn(fixture, ['ls .secrets'], mem))).toContain('games.txt');
	});

	it('refuses a say message the chat schema would reject', () => {
		const out = textOf(runOn(fixture, ['say ' + 'a'.repeat(CHAT_MAX_MESSAGE_LENGTH + 1)]));
		expect(out).toContain(
			'say: messages can be at most ' + CHAT_MAX_MESSAGE_LENGTH + ' characters'
		);
		expect(out).not.toContain('shows up in /Chat');
		expect(out).not.toContain('(sent to /Chat)');
	});

	it('takes a rename made outside the shell, capped like username', () => {
		const lines: string[] = [];
		const sent: string[] = [];
		const ctx = {
			print: (l: { t: string }[]) => lines.push(l.map((s) => s.t).join('')),
			sendChat: (user: string) => {
				sent.push(user);
				return 'sent' as const;
			}
		};
		const sh = createShell(
			new Proxy(ctx, { get: (t, k) => (t as never)[k] ?? (() => {}) }) as never,
			{
				data: fixture,
				user: 'Guest_1',
				store: createAchievementStore(memoryStorage())
			}
		);
		sh.setUser('Neo');
		sh.run('say hi');
		expect(sent).toEqual(['Neo']);
		expect(sh.promptText()).toBe('neo@bobbynooby.dev:~$');
		sh.setUser('x'.repeat(40));
		expect(sh.state.user).toHaveLength(24);
		sh.setUser('\u3164');
		expect(sh.state.user).toBe('x'.repeat(24));
	});
});
