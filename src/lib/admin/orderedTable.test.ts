import { describe, expect, it } from 'vitest';
import { OrderedTable } from './orderedTable.svelte';
import { ThreeByThreeCollection } from './threeByThreeList.svelte';
import type { threeByThreeEntry, threeByThreeServerData } from '../types';

describe('OrderedTable', () => {
	it('keeps valid uids and computes the next uid above the highest', () => {
		const table = new OrderedTable([
			{ uid: 4, name: 'a' },
			{ uid: 2, name: 'b' }
		]);
		expect(table.items.map((item) => item.uid)).toEqual([4, 2]);
		table.createNew({ name: 'c' });
		expect(table.items[2].uid).toBe(5);
	});

	it('renumbers duplicate uids instead of keeping colliding keys', () => {
		const table = new OrderedTable([
			{ uid: 0, name: 'a' },
			{ uid: 0, name: 'b' },
			{ uid: 0, name: 'c' }
		]);
		const uids = table.items.map((item) => item.uid);
		expect(new Set(uids).size).toBe(3);
		expect(table.items[0].uid).toBe(0);
	});

	it('assigns uids to rows that lack one (legacy data)', () => {
		const rows: { uid: number; name: string }[] = [
			{ uid: undefined as unknown as number, name: 'a' },
			{ uid: 7, name: 'b' }
		];
		const table = new OrderedTable(rows);
		const uids = table.items.map((item) => item.uid);
		expect(uids.every((uid) => Number.isInteger(uid))).toBe(true);
		expect(new Set(uids).size).toBe(2);
	});

	it('createNew appends at the end with a fresh uid', () => {
		const table = new OrderedTable([{ uid: 0, name: 'a' }]);
		table.createNew({ name: 'b' });
		expect(table.items.map((item) => item.name)).toEqual(['a', 'b']);
		expect(table.items[1].uid).toBe(1);
	});

	it('createNew works on an empty table', () => {
		const table = new OrderedTable<{ uid: number; name: string }>([]);
		table.createNew({ name: 'only' });
		expect(table.items).toHaveLength(1);
		expect(table.items[0].uid).toBe(0);
	});

	it('swapOrder moves a row up and down', () => {
		const table = new OrderedTable([
			{ uid: 0, name: 'a' },
			{ uid: 1, name: 'b' },
			{ uid: 2, name: 'c' }
		]);
		table.swapOrder(2, 1);
		expect(table.items.map((item) => item.name)).toEqual(['a', 'c', 'b']);
		// ['a', 'c', 'b'] -> remove 'b' from index 2, insert at 0
		table.swapOrder(2, 0);
		expect(table.items.map((item) => item.name)).toEqual(['b', 'a', 'c']);
	});

	it('swapOrder ignores out-of-bounds and degenerate moves', () => {
		const table = new OrderedTable([
			{ uid: 0, name: 'a' },
			{ uid: 1, name: 'b' }
		]);
		table.swapOrder(0, -1);
		table.swapOrder(0, 2);
		table.swapOrder(-1, 0);
		table.swapOrder(1, 1);
		table.swapOrder(2, 0);
		expect(table.items.map((item) => item.name)).toEqual(['a', 'b']);
	});

	it('swapOrder no-ops on empty and single-row tables', () => {
		const empty = new OrderedTable<{ uid: number; name: string }>([]);
		expect(() => empty.swapOrder(0, 1)).not.toThrow();

		const single = new OrderedTable([{ uid: 0, name: 'a' }]);
		expect(() => single.swapOrder(0, 1)).not.toThrow();
		expect(single.items).toHaveLength(1);
	});

	it('deleteByUid removes the right row wherever it sits', () => {
		const table = new OrderedTable([
			{ uid: 0, name: 'a' },
			{ uid: 1, name: 'b' },
			{ uid: 2, name: 'c' }
		]);
		table.deleteByUid(1);
		expect(table.items.map((item) => item.name)).toEqual(['a', 'c']);
	});

	it('deleteByUid ignores unknown uids', () => {
		const table = new OrderedTable([{ uid: 0, name: 'a' }]);
		table.deleteByUid(999);
		expect(table.items).toHaveLength(1);
	});

	it('deleted uids are not reused by createNew', () => {
		const table = new OrderedTable([
			{ uid: 0, name: 'a' },
			{ uid: 1, name: 'b' }
		]);
		table.deleteByUid(1);
		table.createNew({ name: 'c' });
		expect(table.items[1].uid).toBe(2);
	});
});

describe('ThreeByThreeCollection', () => {
	const entry = (uid: number, id: string): threeByThreeEntry => ({
		uid,
		id,
		label: `entry ${id}`,
		review: '',
		bobscore: 0
	});

	// Fresh objects per test: the constructors mutate the arrays they receive.
	function makeServerData(): threeByThreeServerData[] {
		return [
			{ label: 'Anime', data: [entry(0, '1'), entry(1, '2')] },
			{ label: 'Manga', data: [entry(0, '9')] }
		];
	}

	it('builds groups and toggles only the named one', () => {
		const collection = new ThreeByThreeCollection(makeServerData());
		expect(collection.groups.map((group) => group.label)).toEqual(['Anime', 'Manga']);
		expect(collection.groups.every((group) => !group.visible)).toBe(true);

		collection.toggle('Anime');
		expect(collection.groups[0].visible).toBe(true);
		expect(collection.groups[1].visible).toBe(false);

		collection.toggle('Anime');
		expect(collection.groups[0].visible).toBe(false);
	});

	it('toggle on an unknown label does nothing', () => {
		const collection = new ThreeByThreeCollection(makeServerData());
		expect(() => collection.toggle('Nope')).not.toThrow();
	});

	it('createNew adds an entry only to the named group', () => {
		const collection = new ThreeByThreeCollection(makeServerData());
		collection.createNew('Manga');
		expect(collection.groups[0].entries.items).toHaveLength(2);
		expect(collection.groups[1].entries.items).toHaveLength(2);
		expect(collection.groups[1].entries.items[1].label).toBe('New Entry');
	});

	it('swapOrder is scoped to the named group', () => {
		const collection = new ThreeByThreeCollection(makeServerData());
		collection.swapOrder('Anime', 0, 1);
		expect(collection.groups[0].entries.items.map((e) => e.id)).toEqual(['2', '1']);
		expect(collection.groups[1].entries.items.map((e) => e.id)).toEqual(['9']);
	});

	it('deleteByUid is scoped to the named group', () => {
		const collection = new ThreeByThreeCollection(makeServerData());
		collection.deleteByUid('Anime', 0);
		expect(collection.groups[0].entries.items.map((e) => e.id)).toEqual(['2']);
		expect(collection.groups[1].entries.items).toHaveLength(1);
	});
});
