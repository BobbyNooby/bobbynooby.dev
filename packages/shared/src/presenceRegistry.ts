import type { PaneKey, PresenceCursor, PresenceState } from './presence';

export type PresenceRegistry<S> = {
	connect: (sock: S, ip: string) => void;
	/** False when the socket's address already holds `maxIdsPerIp` other ids. */
	hello: (sock: S, id: string, name: string) => boolean;
	move: (sock: S, pane: PaneKey, x: number, y: number, now: number) => void;
	hide: (sock: S) => void;
	disconnect: (sock: S) => void;
	expire: (now: number) => void;
	here: () => number;
	stateFor: (sock: S) => PresenceState;
	/** Bumps whenever any state could look different, so broadcasts can skip idle ticks. */
	version: () => number;
};

type Visitor<S> = {
	sockets: Set<S>;
	name: string;
	pos?: { pane: PaneKey; x: number; y: number };
	lastMove: number;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function createPresenceRegistry<S>({
	maxIdsPerIp = 8,
	cursorTtlMs = 10_000
}: { maxIdsPerIp?: number; cursorTtlMs?: number } = {}): PresenceRegistry<S> {
	const sockets = new Map<S, { ip: string; id?: string }>();
	const visitors = new Map<string, Visitor<S>>();
	// ip -> id -> number of that id's sockets on this ip
	const idsByIp = new Map<string, Map<string, number>>();
	let version = 0;

	function visitorOf(sock: S) {
		const id = sockets.get(sock)?.id;
		return id === undefined ? undefined : visitors.get(id);
	}

	function detach(sock: S) {
		const entry = sockets.get(sock);
		if (entry?.id === undefined) return;
		const { ip, id } = entry;
		entry.id = undefined;

		const ids = idsByIp.get(ip);
		if (ids) {
			const count = (ids.get(id) ?? 0) - 1;
			if (count > 0) ids.set(id, count);
			else ids.delete(id);
			if (ids.size === 0) idsByIp.delete(ip);
		}

		const visitor = visitors.get(id);
		if (!visitor) return;
		visitor.sockets.delete(sock);
		if (visitor.sockets.size === 0) {
			visitors.delete(id);
			version++;
		}
	}

	return {
		connect: (sock, ip) => {
			if (!sockets.has(sock)) sockets.set(sock, { ip });
		},

		hello: (sock, id, name) => {
			const entry = sockets.get(sock);
			if (!entry) return false;

			if (entry.id !== id) {
				detach(sock);
				const ids = idsByIp.get(entry.ip) ?? new Map<string, number>();
				if (!ids.has(id) && ids.size >= maxIdsPerIp) return false;
				ids.set(id, (ids.get(id) ?? 0) + 1);
				idsByIp.set(entry.ip, ids);
				entry.id = id;

				let visitor = visitors.get(id);
				if (!visitor) {
					visitor = { sockets: new Set(), name, lastMove: 0 };
					visitors.set(id, visitor);
				}
				visitor.sockets.add(sock);
			}

			visitors.get(id)!.name = name;
			// Always bump: a new tab of a known id needs a state without its own cursor.
			version++;
			return true;
		},

		move: (sock, pane, x, y, now) => {
			const visitor = visitorOf(sock);
			if (!visitor || !Number.isFinite(x) || !Number.isFinite(y)) return;
			visitor.pos = { pane, x: clamp01(x), y: clamp01(y) };
			visitor.lastMove = now;
			version++;
		},

		hide: (sock) => {
			const visitor = visitorOf(sock);
			if (!visitor?.pos) return;
			visitor.pos = undefined;
			version++;
		},

		disconnect: (sock) => {
			detach(sock);
			sockets.delete(sock);
		},

		expire: (now) => {
			for (const visitor of visitors.values()) {
				if (visitor.pos && now - visitor.lastMove >= cursorTtlMs) {
					visitor.pos = undefined;
					version++;
				}
			}
		},

		here: () => visitors.size,

		stateFor: (sock) => {
			const ownId = sockets.get(sock)?.id;
			const cursors: PresenceCursor[] = [];
			for (const [id, { name, pos }] of visitors) {
				if (id === ownId || !pos) continue;
				cursors.push({ id, name, pane: pos.pane, x: pos.x, y: pos.y });
			}
			return { t: 'state', here: visitors.size, cursors };
		},

		version: () => version
	};
}
