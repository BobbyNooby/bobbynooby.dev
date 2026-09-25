import { browser } from '$app/environment';
import { PUBLIC_WEBSOCKET_BASE_URL } from '$env/static/public';

export type LiveSocket = {
	send: (data: string) => void;
	close: () => void;
};

const MAX_BACKOFF_MS = 30_000;

/**
 * A WebSocket that reconnects with exponential backoff until close() is
 * called. Widgets used to open bare WebSockets with no onclose handler, so
 * a dropped connection (backend restart, NAT timeout) froze them until a
 * page refresh. Returns a do-nothing stub during SSR, where sockets can't
 * exist.
 */
export function createLiveSocket<T>(path: string, onMessage: (data: T) => void): LiveSocket {
	if (!browser) {
		return { send: () => {}, close: () => {} };
	}

	let ws: WebSocket | null = null;
	let retryTimer: ReturnType<typeof setTimeout> | null = null;
	let attempt = 0;
	let closed = false;

	function connect() {
		ws = new WebSocket(`${PUBLIC_WEBSOCKET_BASE_URL}${path}`);
		ws.onopen = () => {
			attempt = 0;
		};
		ws.onmessage = (event) => {
			try {
				onMessage(JSON.parse(event.data));
			} catch {
				console.error(`liveSocket ${path}: dropped malformed message`);
			}
		};
		// onclose fires after errors too, so it is the only reconnect trigger
		ws.onclose = () => {
			if (closed) return;
			const delay = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** attempt) + Math.random() * 500;
			attempt += 1;
			retryTimer = setTimeout(connect, delay);
		};
	}

	connect();

	return {
		send: (data: string) => {
			if (ws?.readyState === WebSocket.OPEN) ws.send(data);
		},
		close: () => {
			closed = true;
			if (retryTimer) clearTimeout(retryTimer);
			ws?.close();
		}
	};
}
