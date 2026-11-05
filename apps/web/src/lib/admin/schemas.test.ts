import { describe, expect, it } from 'vitest';
import {
	entryIssues,
	entrySchema,
	idFromInput,
	issues,
	linkSchema,
	listSchema,
	projectSchema
} from './schemas';

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

describe('3x3 AniList id', () => {
	const entry = (id: string | number) => ({ uid: 1, id, label: 'GTO', bobscore: 0.9 });

	it.each(['', 'abc', '-5', '+5', '1.5', ' 123', '123 ', '0x10', '1e5', '0', '2147483648'])(
		'rejects %j on the server and in the editor',
		(id) => {
			expect(entrySchema.safeParse(entry(id)).success).toBe(false);
			expect(entryIssues(entry(id))).toEqual(new Set(['id']));
		}
	);

	it('rejects a 20-digit id instead of rounding it', () => {
		expect(entryIssues(entry('99999999999999999999'))).toEqual(new Set(['id']));
	});

	it('accepts digit strings and legacy integer ids in range', () => {
		for (const id of ['1', '245', '2147483647', 245, 2147483647]) {
			expect(entryIssues(entry(id))).toEqual(new Set());
		}
	});

	it('rejects legacy number ids that are not ids', () => {
		for (const id of [0, -5, 1.5, 2147483648, NaN]) {
			expect(entryIssues(entry(id))).toEqual(new Set(['id']));
		}
	});

	it('stores typed digits as a number only when nothing is lost', () => {
		expect(idFromInput('245')).toBe(245);
		expect(idFromInput('99999999999999999999')).toBe('99999999999999999999');
		expect(idFromInput('1e5')).toBe('1e5');
		expect(idFromInput('')).toBe('');
	});
});

describe('entryIssues', () => {
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
