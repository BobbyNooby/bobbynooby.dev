// Unsaved changes in one table: each added, removed or edited row counts once,
// and a new order of the rows that are still there counts once more.
export function countChanges<T extends { uid: number }>(current: T[], saved: T[]): number {
	const before = new Map(saved.map((row) => [row.uid, JSON.stringify(row)]));
	const now = new Set(current.map((row) => row.uid));
	let count = 0;
	for (const row of current) {
		if (before.get(row.uid) !== JSON.stringify(row)) count++;
	}
	for (const row of saved) {
		if (!now.has(row.uid)) count++;
	}
	const keptNow = current.filter((row) => before.has(row.uid)).map((row) => row.uid);
	const keptBefore = saved.filter((row) => now.has(row.uid)).map((row) => row.uid);
	if (keptNow.join() !== keptBefore.join()) count++;
	return count;
}
