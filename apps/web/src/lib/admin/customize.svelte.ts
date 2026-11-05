import type { threeByThreeEntry, threeByThreeServerData } from '$lib/types';
import { tick } from 'svelte';
import { countChanges } from './changes';
import { OrderedTable } from './orderedTable.svelte';
import { entryIssues, issues, linkSchema, projectSchema } from './schemas';
import { ThreeByThreeCollection } from './threeByThreeList.svelte';

export type LinkRow = { uid: number; label: string; href: string; color: string };
export type ProjectRow = { uid: number; title: string; description: string; href: string };
export type Toast = { text: string; bad?: boolean; undo?: () => void };

type Saved = {
	links: LinkRow[];
	projects: ProjectRow[];
	grid: Record<string, threeByThreeEntry[]>;
};

const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value));

// The customize editor: the three tables, the last-saved copy they are diffed
// against, and the delete-with-undo toast.
export class CustomizeState {
	links: OrderedTable<LinkRow>;
	projects: OrderedTable<ProjectRow>;
	grid: ThreeByThreeCollection;
	toast = $state<Toast | null>(null);
	flashUid = $state<number | null>(null);
	// The row under the pointer skips its flip animation so it can follow the pointer.
	dragUid = $state<number | null>(null);
	#saved = $state.raw<Saved>({ links: [], projects: [], grid: {} });
	#toastTimer: ReturnType<typeof setTimeout> | undefined;
	#flashTimer: ReturnType<typeof setTimeout> | undefined;

	constructor(data: {
		links: LinkRow[];
		projects: ProjectRow[];
		all3x3Data: threeByThreeServerData[];
	}) {
		this.links = new OrderedTable(data.links);
		this.projects = new OrderedTable(data.projects);
		this.grid = new ThreeByThreeCollection(data.all3x3Data);
		// Taken after the tables renumber any missing uids, so the diff lines up.
		this.#saved = this.#snapshot();
	}

	#snapshot(): Saved {
		return {
			links: copy(this.links.items),
			projects: copy(this.projects.items),
			grid: Object.fromEntries(this.grid.groups.map((g) => [g.label, copy(g.entries.items)]))
		};
	}

	get unsaved(): number {
		let count =
			countChanges(this.links.items, this.#saved.links) +
			countChanges(this.projects.items, this.#saved.projects);
		for (const group of this.grid.groups) {
			count += countChanges(group.entries.items, this.#saved.grid[group.label] ?? []);
		}
		return count;
	}

	get problems(): number {
		let count = this.links.items.filter((row) => issues(linkSchema, row).size > 0).length;
		count += this.projects.items.filter((row) => issues(projectSchema, row).size > 0).length;
		for (const group of this.grid.groups) {
			count += group.entries.items.filter((entry) => entryIssues(entry).size > 0).length;
		}
		return count;
	}

	/** The hidden form fields the update action reads. */
	payload() {
		return {
			linksTable: JSON.stringify(this.links.items),
			projectsTable: JSON.stringify(this.projects.items),
			all3x3Data: JSON.stringify(this.grid.groups)
		};
	}

	markSaved() {
		this.#saved = this.#snapshot();
	}

	discard() {
		this.links.items = copy(this.#saved.links);
		this.projects.items = copy(this.#saved.projects);
		for (const group of this.grid.groups) {
			group.entries.items = copy(this.#saved.grid[group.label] ?? []);
		}
		this.toast = null;
	}

	remove<T extends { uid: number }>(table: OrderedTable<T>, uid: number, name: string) {
		const index = table.items.findIndex((row) => row.uid === uid);
		if (index === -1) return;
		const [row] = table.items.splice(index, 1);
		this.notify(`deleted ${name}`, {
			undo: () => {
				table.insertAt(index, row);
				this.flash(uid);
			}
		});
	}

	undo() {
		const undo = this.toast?.undo;
		this.toast = null;
		undo?.();
	}

	/** Moves a row and flashes it so the eye can follow where it went. */
	move<T extends { uid: number }>(table: OrderedTable<T>, from: number, to: number) {
		const uid = table.items[from]?.uid;
		table.swapOrder(from, to);
		if (uid != null) this.flash(uid);
	}

	async flash(uid: number) {
		this.flashUid = null;
		await tick();
		this.flashUid = uid;
		clearTimeout(this.#flashTimer);
		this.#flashTimer = setTimeout(() => (this.flashUid = null), 800);
	}

	notify(text: string, options: { bad?: boolean; undo?: () => void } = {}) {
		this.toast = { text, ...options };
		clearTimeout(this.#toastTimer);
		this.#toastTimer = setTimeout(() => (this.toast = null), options.undo ? 6000 : 2600);
	}
}
