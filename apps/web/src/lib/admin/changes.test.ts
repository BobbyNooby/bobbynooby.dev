import { describe, expect, it } from 'vitest';
import { countChanges } from './changes';

const rows = () => [
	{ uid: 1, name: 'a' },
	{ uid: 2, name: 'b' },
	{ uid: 3, name: 'c' }
];

describe('countChanges', () => {
	it('is 0 when nothing changed', () => {
		expect(countChanges(rows(), rows())).toBe(0);
	});

	it('counts each edited row once', () => {
		const current = rows();
		current[0].name = 'x';
		current[0].name = 'xy';
		current[2].name = 'z';
		expect(countChanges(current, rows())).toBe(2);
	});

	it('counts added and removed rows', () => {
		const current = rows().slice(1);
		current.push({ uid: 9, name: 'new' });
		expect(countChanges(current, rows())).toBe(2);
	});

	it('counts a reorder once, however many rows moved', () => {
		expect(countChanges(rows().reverse(), rows())).toBe(1);
	});

	it('does not count a removal as a reorder too', () => {
		const current = rows();
		current.splice(0, 1);
		expect(countChanges(current, rows())).toBe(1);
	});

	it('is 0 again once an edit is typed back', () => {
		const current = rows();
		current[1].name = 'changed';
		current[1].name = 'b';
		expect(countChanges(current, rows())).toBe(0);
	});
});
