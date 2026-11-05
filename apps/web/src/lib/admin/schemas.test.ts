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
import { fromTen } from './score';

describe('issues', () => {
	it('is empty for a valid link', () => {
		const link = { uid: 1, label: 'GitHub', href: 'https://github.com/x', color: '#79A3AF' };
		expect(issues(linkSchema, link)).toEqual(new Set());
	});

	it('names each bad field of a link', () => {
		const link = { uid: 1, label: '', href: 'javascript:alert(1)', color: 'not a colour' };
		expect(issues(linkSchema, link)).toEqual(new Set(['label', 'href', 'color']));
	});

	it('rejects hex of the wrong length and words that are not colours', () => {
		for (const color of ['#12345', 'notacolour']) {
			const link = { uid: 1, label: 'Blog', href: 'http://example.com', color };
			expect(issues(linkSchema, link)).toEqual(new Set(['color']));
		}
	});

	it('accepts colour names', () => {
		const link = { uid: 1, label: 'Blog', href: 'http://example.com', color: 'red' };
		expect(issues(linkSchema, link)).toEqual(new Set());
	});

	it('names a bad project title or link', () => {
		const project = { uid: 1, title: '', description: '', href: 'ftp://x' };
		expect(issues(projectSchema, project)).toEqual(new Set(['title', 'href']));
	});

	it('rejects whitespace-only link labels, project titles and tile labels', () => {
		const link = { uid: 1, label: '   ', href: 'https://x.dev', color: 'red' };
		const project = { uid: 1, title: '\t ', description: '', href: 'https://x.dev' };
		const entry = { uid: 1, id: 245, label: '  ', bobscore: 0.9 };
		expect(issues(linkSchema, link)).toEqual(new Set(['label']));
		expect(issues(projectSchema, project)).toEqual(new Set(['title']));
		expect(entrySchema.safeParse(entry).success).toBe(false);
	});
});

describe('link and project hrefs', () => {
	// The home page only renders hrefs that parse as an absolute http(s) URL.
	it.each([
		'https://',
		'http://',
		'https://not a url',
		'/shorten',
		'//evil.example',
		'example.com'
	])('rejects %j, which the home page would drop', (href) => {
		const link = { uid: 1, label: 'x', href, color: 'red' };
		const project = { uid: 1, title: 'x', description: '', href };
		expect(issues(linkSchema, link)).toEqual(new Set(['href']));
		expect(issues(projectSchema, project)).toEqual(new Set(['href']));
	});

	it.each(['https://github.com/b', 'HTTP://example.com/a?b=c#d', 'https://bobbynooby.dev/3x3'])(
		'accepts %j',
		(href) => {
			expect(issues(linkSchema, { uid: 1, label: 'x', href, color: 'red' })).toEqual(new Set());
		}
	);
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

	it('flags a score typed above 10 or below 0', () => {
		for (const text of ['11', '10.5', '-1']) {
			const entry = { uid: 1, id: 245, label: 'GTO', bobscore: fromTen(text) };
			expect(entryIssues(entry)).toEqual(new Set(['bobscore']));
		}
	});

	it('flags a stored score outside 0-1, like a legacy 6.9', () => {
		expect(entryIssues({ uid: 1, id: 85802, label: 'DG', bobscore: 6.9 })).toEqual(
			new Set(['bobscore'])
		);
	});
});

describe('entrySchema bobscore', () => {
	const entry = (bobscore: unknown) => ({ uid: 1, id: 245, label: 'GTO', bobscore });

	it.each([0, 0.75, 1, '0.9'])('accepts %j', (bobscore) => {
		expect(entrySchema.safeParse(entry(bobscore)).success).toBe(true);
	});

	it.each(['', '  ', null, [], true, 1.1, -0.1, '1e-1', '0x1', NaN])(
		'rejects a forged %j',
		(bobscore) => {
			expect(entrySchema.safeParse(entry(bobscore)).success).toBe(false);
		}
	);
});

describe('listSchema', () => {
	it('rejects list labels that could name an arbitrary collection', () => {
		expect(listSchema.safeParse({ label: 'x;drop', data: [] }).success).toBe(false);
		expect(listSchema.safeParse({ label: 'Anime', data: [] }).success).toBe(true);
	});
});
