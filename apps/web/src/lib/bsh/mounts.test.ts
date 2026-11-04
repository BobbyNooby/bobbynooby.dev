import { describe, expect, it } from 'vitest';
import { buildFs } from './fs';
import { createMounts } from './mounts';
import type { BshData, BshProject, DirNode, FileNode } from './types';

const env = {
	live: () => ({ discord: 'online' as const, twitchLive: false, playing: false }),
	now: () => new Date('2026-11-04T12:00:00Z'),
	timeZone: 'UTC'
};
const empty: BshData = { links: [], projects: [], games: [], lastPlayed: null, threeByThree: {} };
const p = (title: string): BshProject => ({ title, description: 'd', href: 'https://example.com' });
const dir = (root: DirNode, name: string) => root.kids[name] as DirNode;

describe('createMounts', () => {
	it('keeps colliding and non-ASCII titles reachable', () => {
		const data = { ...empty, projects: [p('Foo!'), p('foo'), p('ヨツバと!')] };
		expect(Object.keys(dir(buildFs(createMounts(data, env)), 'projects').kids)).toEqual([
			'foo.txt',
			'foo-2.txt',
			'projects-3.txt'
		]);
	});

	it('drops unsafe hrefs from files and segments', () => {
		const data = {
			...empty,
			projects: [{ title: 'x', description: 'd', href: 'javascript:alert(1)' }]
		};
		const file = dir(buildFs(createMounts(data, env)), 'projects').kids['x.txt'] as FileNode;
		expect(file.href).toBeUndefined();
		expect(
			file
				.lines()
				.flat()
				.some((s) => s.href)
		).toBe(false);
	});

	it('builds from empty data', () => {
		const root = buildFs(createMounts(empty, env));
		expect(Object.keys(dir(root, 'games').kids)).toEqual([]);
		expect(Object.keys(dir(root, 'music').kids)).toEqual(['playlist.txt']);
	});

	it('reads live status at cat time', () => {
		let discord: 'online' | 'dnd' = 'online';
		const root = buildFs(createMounts(empty, { ...env, live: () => ({ ...env.live(), discord }) }));
		const file = dir(root, 'status').kids['discord.txt'] as FileNode;
		discord = 'dnd';
		expect(file.lines()).toEqual([[{ t: 'dnd.sh', c: '#F23F43' }]]);
	});
});
