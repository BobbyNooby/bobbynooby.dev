export type TokenBucket = { tryTake: () => boolean };

export function createTokenBucket(opts: {
	capacity: number;
	refillPerSecond: number;
	now?: () => number;
}): TokenBucket {
	const now = opts.now ?? Date.now;
	let tokens = opts.capacity;
	let last = now();
	return {
		tryTake: () => {
			const t = now();
			tokens = Math.min(opts.capacity, tokens + ((t - last) / 1000) * opts.refillPerSecond);
			last = t;
			if (tokens >= 1) {
				tokens -= 1;
				return true;
			}
			return false;
		}
	};
}
