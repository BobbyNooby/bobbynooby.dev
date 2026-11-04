import { describe, expect, it } from 'vitest';
import fixtureJson from './fixtures/site-data.json';
import { buildFs, pathOf, resolve, treeText } from './fs';
import { createMounts } from './mounts';
import type { BshData, DirNode } from './types';

const fixture = fixtureJson as unknown as BshData;
const env = {
	live: () => ({ discord: 'online' as const, twitchLive: false, playing: false }),
	now: () => new Date('2026-11-04T12:00:00Z'),
	timeZone: 'UTC'
};
const root = buildFs(createMounts(fixture, env));

describe('buildFs', () => {
	it('builds the top level in mount order', () => {
		expect(Object.keys(root.kids)).toEqual([
			'about_me.txt',
			'projects',
			'links',
			'games',
			'3x3',
			'music',
			'status',
			'chat',
			'blog',
			'.secrets'
		]);
		expect(Object.keys((root.kids['3x3'] as DirNode).kids)).toEqual(['anime', 'manga']);
	});
});

describe('resolve', () => {
	it('resolves relative, absolute, case-insensitive and .. paths', () => {
		expect(resolve(root, [], 'PROJECTS/Agamoto.txt', false).node?.type).toBe('file');
		expect(resolve(root, ['3x3', 'manga'], '..', false).parts).toEqual(['3x3']);
		expect(resolve(root, ['games'], '~/links', false).parts).toEqual(['links']);
		expect(resolve(root, [], './about_me.txt', false).node?.type).toBe('file');
	});

	it('locks .secrets until trusted', () => {
		expect(resolve(root, [], '.secrets/credits.txt', false)).toMatchObject({
			node: null,
			locked: true
		});
		expect(resolve(root, [], '.secrets/credits.txt', true).node?.type).toBe('file');
	});
});

describe('pathOf and treeText', () => {
	it('prints home-relative paths', () => {
		expect(pathOf([])).toBe('~');
		expect(pathOf(['3x3', 'anime'])).toBe('~/3x3/anime');
	});

	it('tree hides hidden entries and marks locked ones', () => {
		expect(treeText(root, false)).not.toContain('└── .secrets/   (locked)');
		expect(treeText(root, false, true)).toContain('└── .secrets/   (locked)');
	});
});
