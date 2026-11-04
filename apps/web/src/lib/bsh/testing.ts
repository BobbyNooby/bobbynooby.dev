// Test helpers for the shell. Not imported by app code.
import type { StorageLike } from './achievements';

export function memoryStorage(initial: Record<string, string> = {}): StorageLike {
	const data = new Map(Object.entries(initial));
	return {
		getItem: (key) => data.get(key) ?? null,
		setItem: (key, value) => void data.set(key, String(value))
	};
}
