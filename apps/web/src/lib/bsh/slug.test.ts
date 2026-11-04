import { describe, expect, it } from 'vitest';
import { fileNames, slug } from './slug';

describe('slug', () => {
	it('slugs like the spec', () => {
		expect(slug('Arcane Odyssey Tools')).toBe('arcane-odyssey-tools');
		expect(slug('C++ & Rust!!')).toBe('c-rust');
		expect(slug('Chainsaw_Man')).toBe('chainsaw_man');
		expect(slug('ヨツバと!')).toBe('');
	});
});

describe('fileNames', () => {
	it('keeps every file name unique and non-empty', () => {
		expect(fileNames(['Foo!', 'foo', 'ヨツバと!', 'Bar'], 'entry', '.txt')).toEqual([
			'foo.txt',
			'foo-2.txt',
			'entry-3.txt',
			'bar.txt'
		]);
	});

	it('never reuses a name that a title already slugs to', () => {
		expect(fileNames(['foo', 'foo-2', 'foo'], 'entry', '.txt')).toEqual([
			'foo.txt',
			'foo-2.txt',
			'foo-3.txt'
		]);
	});
});
