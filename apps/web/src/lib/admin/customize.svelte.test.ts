import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { CustomizeState } from './customize.svelte';
import { parsePayload } from './parsePayload';
import { idFromInput, linkSchema, listSchema, projectSchema } from './schemas';

const data = () => ({
	links: [
		{ uid: 0, label: 'GitHub', href: 'https://github.com/b', color: '#79A3AF' },
		{ uid: 1, label: 'Twitch', href: 'https://twitch.tv/b', color: '#9147FF' }
	],
	projects: [{ uid: 0, title: 'agamoto', description: 'cli', href: 'https://github.com/b/a' }],
	all3x3Data: [{ label: 'Anime', data: [{ uid: 0, id: 245, label: 'GTO', bobscore: 0.9 }] }]
});

const labels = (cz: CustomizeState) => cz.links.items.map((l) => l.label);

describe('CustomizeState', () => {
	it('starts with nothing unsaved and no problems', () => {
		const cz = new CustomizeState(data());
		expect(cz.unsaved).toBe(0);
		expect(cz.problems).toBe(0);
	});

	it('counts edits across every table', () => {
		const cz = new CustomizeState(data());
		cz.links.items[0].label = 'Git';
		cz.projects.items[0].title = 'agamoto2';
		cz.grid.groups[0].entries.items[0].label = 'Great Teacher';
		expect(cz.unsaved).toBe(3);
	});

	it('counts rows that would fail the save checks', () => {
		const cz = new CustomizeState(data());
		cz.links.items[1].href = 'twitch.tv/b';
		cz.grid.groups[0].entries.items[0].id = '';
		expect(cz.problems).toBe(2);
	});

	it('a new link with the default https:// is a problem until a real URL is typed', () => {
		const cz = new CustomizeState(data());
		const uid = cz.links.createNew({ label: 'New_Link', href: 'https://', color: '#FFFFFF' });
		expect(cz.problems).toBe(1);
		cz.links.items.find((l) => l.uid === uid)!.href = 'https://example.com';
		expect(cz.problems).toBe(0);
	});

	it('retyping a legacy number id as the same digits is not a change', () => {
		const cz = new CustomizeState(data());
		const entry = cz.grid.groups[0].entries.items[0];
		entry.id = idFromInput('24');
		entry.id = idFromInput('245');
		expect(cz.unsaved).toBe(0);
	});

	it('remove offers an undo that puts the row back', () => {
		const cz = new CustomizeState(data());
		cz.remove(cz.links, 0, 'GitHub');
		expect(labels(cz)).toEqual(['Twitch']);
		expect(cz.unsaved).toBe(1);
		expect(cz.toast?.text).toContain('GitHub');
		cz.undo();
		expect(labels(cz)).toEqual(['GitHub', 'Twitch']);
		expect(cz.unsaved).toBe(0);
		expect(cz.toast).toBeNull();
	});

	it('discard goes back to the last save', () => {
		const cz = new CustomizeState(data());
		cz.links.swapOrder(0, 1);
		cz.projects.items[0].description = 'changed';
		cz.discard();
		expect(labels(cz)).toEqual(['GitHub', 'Twitch']);
		expect(cz.projects.items[0].description).toBe('cli');
		expect(cz.unsaved).toBe(0);
	});

	it('markSaved makes the saved tables the new baseline', () => {
		const cz = new CustomizeState(data());
		cz.links.items[0].label = 'Git';
		cz.beginSave().markSaved();
		expect(cz.unsaved).toBe(0);
		cz.discard();
		expect(labels(cz)).toEqual(['Git', 'Twitch']);
	});

	it('a save marks only what it sent as saved, not edits typed while it was out', () => {
		const cz = new CustomizeState(data());
		cz.links.items[0].label = 'Git';
		const sent = cz.beginSave();
		cz.links.items[1].label = 'Twitch.tv';
		cz.grid.groups[0].entries.items[0].label = 'Great Teacher';
		sent.markSaved();
		expect(JSON.parse(sent.payload.linksTable).map((l: { label: string }) => l.label)).toEqual([
			'Git',
			'Twitch'
		]);
		expect(cz.unsaved).toBe(2);
		cz.discard();
		expect(labels(cz)).toEqual(['Git', 'Twitch']);
		expect(cz.grid.groups[0].entries.items[0].label).toBe('GTO');
	});

	it('builds a save payload the server schemas accept', () => {
		const cz = new CustomizeState(data());
		cz.links.createNew({ label: 'New_Link', href: 'https://x.dev', color: '#FFFFFF' });
		const form = new FormData();
		for (const [name, value] of Object.entries(cz.payload())) form.set(name, value);
		expect(parsePayload(z.array(linkSchema), form.get('linksTable'), 'links')).toHaveLength(3);
		expect(
			parsePayload(z.array(projectSchema), form.get('projectsTable'), 'projects')
		).toHaveLength(1);
		expect(parsePayload(z.array(listSchema), form.get('all3x3Data'), '3x3 lists')[0]).toMatchObject(
			{
				label: 'Anime',
				data: [{ id: 245, label: 'GTO' }]
			}
		);
	});
});
