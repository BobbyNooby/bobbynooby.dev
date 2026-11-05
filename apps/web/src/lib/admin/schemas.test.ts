import { describe, expect, it } from 'vitest';
import { entryIssues, issues, linkSchema, listSchema, projectSchema } from './schemas';

describe('issues', () => {
	it('is empty for a valid link', () => {
		const link = { uid: 1, label: 'GitHub', href: 'https://github.com/x', color: '#79A3AF' };
		expect(issues(linkSchema, link)).toEqual(new Set());
	});

	it('names each bad field of a link', () => {
		const link = { uid: 1, label: '', href: 'javascript:alert(1)', color: 'not a colour' };
		expect(issues(linkSchema, link)).toEqual(new Set(['label', 'href', 'color']));
	});

	it('accepts site-relative links and colour names', () => {
		const link = { uid: 1, label: '3x3', href: '/3x3', color: 'red' };
		expect(issues(linkSchema, link)).toEqual(new Set());
	});

	it('names a bad project title or link', () => {
		const project = { uid: 1, title: '', description: '', href: 'ftp://x' };
		expect(issues(projectSchema, project)).toEqual(new Set(['title', 'href']));
	});
});

describe('entryIssues', () => {
	it('flags an empty AniList id even though the server would take it', () => {
		expect(entryIssues({ uid: 1, id: '', label: 'GTO', bobscore: 0.9 })).toEqual(new Set(['id']));
	});

	it('flags an empty label and a score that is not a number', () => {
		expect(entryIssues({ uid: 1, id: 245, label: ' ', bobscore: NaN })).toEqual(
			new Set(['label', 'bobscore'])
		);
	});

	it('leaves scores above 10 alone', () => {
		expect(entryIssues({ uid: 1, id: 85802, label: 'DG', bobscore: 6.9 }).size).toBe(0);
	});
});

describe('listSchema', () => {
	it('rejects list labels that could name an arbitrary collection', () => {
		expect(listSchema.safeParse({ label: 'x;drop', data: [] }).success).toBe(false);
		expect(listSchema.safeParse({ label: 'Anime', data: [] }).success).toBe(true);
	});
});
