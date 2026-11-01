export type ConnectionLimiter = {
	tryAcquire: (key: string) => boolean;
	release: (key: string) => void;
	size: () => number;
};

export function createConnectionLimiter(maxPerKey: number): ConnectionLimiter {
	const counts = new Map<string, number>();
	return {
		tryAcquire: (key) => {
			const count = counts.get(key) ?? 0;
			if (count >= maxPerKey) return false;
			counts.set(key, count + 1);
			return true;
		},
		release: (key) => {
			const count = (counts.get(key) ?? 0) - 1;
			if (count > 0) counts.set(key, count);
			else counts.delete(key);
		},
		size: () => counts.size
	};
}
