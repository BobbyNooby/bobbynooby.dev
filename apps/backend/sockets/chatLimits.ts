import { createTokenBucket } from "@bobbynooby/shared";

const IDLE_MS = 5 * 60_000;

export type ChatEntry = {
  bucket: ReturnType<typeof createTokenBucket>;
  seen: number;
};

// Per-identity chat rate limiting: 5 messages instantly, then one every 2s.
// Authed users are keyed by session id, guests by socket address; entries
// idle for over 5 minutes are evicted on each connect to bound the map.
export function createChatLimits() {
  const chatBuckets = new Map<string, ChatEntry>();

  /** The bucket for this identity (made if new), after evicting idle ones. */
  function entryFor(key: string): ChatEntry {
    const nowMs = Date.now();
    for (const [k, entry] of chatBuckets) {
      if (nowMs - entry.seen > IDLE_MS) {
        chatBuckets.delete(k);
      }
    }
    let entry = chatBuckets.get(key);
    if (entry == undefined) {
      entry = {
        bucket: createTokenBucket({ capacity: 5, refillPerSecond: 0.5 }),
        seen: nowMs,
      };
      chatBuckets.set(key, entry);
    }
    entry.seen = nowMs;
    return entry;
  }

  return { entryFor };
}
