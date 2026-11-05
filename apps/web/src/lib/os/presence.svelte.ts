import { createLiveSocket, type LiveSocket } from '$lib/utils/liveSocket';
import {
	PRESENCE_NAME_MAX_LENGTH,
	type PaneKey,
	type PresenceClientMessage,
	type PresenceState as PresenceWire
} from '@bobbynooby/shared';
import type { CursorSample } from './cursorSample';

export type Visitor = { id: string; name: string; pane: PaneKey; color: string };

const SEND_EVERY_MS = 83;
const BUFFER = 30;
const ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

function readFlag(key: string): boolean {
	try {
		return localStorage.getItem(key) !== 'off';
	} catch {
		return true;
	}
}

function writeFlag(key: string, on: boolean) {
	try {
		localStorage.setItem(key, on ? 'on' : 'off');
	} catch {
		// private mode: the toggle still applies for this visit
	}
}

function visitorId(): string {
	try {
		const saved = localStorage.getItem('presence:id');
		if (saved && ID_PATTERN.test(saved)) return saved;
		const fresh = crypto.randomUUID();
		localStorage.setItem('presence:id', fresh);
		return fresh;
	} catch {
		return crypto.randomUUID();
	}
}

export function colorFor(id: string): string {
	let h = 0;
	for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
	return `hsl(${h % 360} 85% 68%)`;
}

// The /presence socket: the visitor count, other people's cursors, and ours.
export class PresenceState {
	here = $state(0);
	others = $state.raw<Visitor[]>([]);
	share = $state(true);
	showOthers = $state(true);
	// Read every animation frame, so deliberately not reactive.
	buffers = new Map<string, CursorSample[]>();
	#ws: LiveSocket | null = null;
	#id = '';
	#name: () => string = () => 'Guest';
	#lastSend = 0;

	start(name: () => string): () => void {
		this.#id = visitorId();
		this.#name = name;
		this.share = readFlag('presence:share');
		this.showOthers = readFlag('presence:others');
		this.#ws = createLiveSocket<PresenceWire>(
			'/presence',
			(msg) => this.#receive(msg),
			() => this.hello()
		);
		const onVisibility = () => document.hidden && this.#send({ t: 'hide' });
		document.addEventListener('visibilitychange', onVisibility);
		return () => {
			document.removeEventListener('visibilitychange', onVisibility);
			this.#ws?.close();
		};
	}

	hello() {
		const name = this.#name().trim().slice(0, PRESENCE_NAME_MAX_LENGTH) || 'Guest';
		this.#send({ t: 'hello', id: this.#id, name });
	}

	// Called on pointermove over the page; x/y are 0–1 inside the pane under the pointer.
	move(pane: PaneKey, x: number, y: number) {
		if (!this.share || document.hidden) return;
		const now = performance.now();
		if (now - this.#lastSend < SEND_EVERY_MS) return;
		this.#lastSend = now;
		this.#send({ t: 'cur', pane, x, y });
	}

	setShare(on: boolean) {
		this.share = on;
		writeFlag('presence:share', on);
		if (!on) this.#send({ t: 'hide' });
	}

	setShowOthers(on: boolean) {
		this.showOthers = on;
		writeFlag('presence:others', on);
	}

	#send(msg: PresenceClientMessage) {
		this.#ws?.send(JSON.stringify(msg));
	}

	#receive(msg: PresenceWire) {
		if (msg?.t !== 'state') return;
		this.here = msg.here;
		const now = performance.now();
		const seen = new Set<string>();
		for (const c of msg.cursors) {
			seen.add(c.id);
			const buf = this.buffers.get(c.id) ?? [];
			buf.push({ t: now, pane: c.pane, x: c.x, y: c.y });
			if (buf.length > BUFFER) buf.shift();
			this.buffers.set(c.id, buf);
		}
		for (const id of this.buffers.keys()) if (!seen.has(id)) this.buffers.delete(id);
		this.others = msg.cursors.map((c) => ({
			id: c.id,
			name: c.name,
			pane: c.pane,
			color: colorFor(c.id)
		}));
	}
}
