export type TwitchLiveStatus = {
	configured: boolean;
	live: boolean;
	title?: string;
	game?: string;
	viewers?: number;
	startedAt?: string;
};

let status = $state<TwitchLiveStatus | null>(null);
let pollers = 0;
let timer: ReturnType<typeof setInterval> | null = null;

async function refresh() {
	try {
		status = await (await fetch('/api/twitch/live')).json();
	} catch {
		status = { configured: true, live: false };
	}
	// Unconfigured only changes with a deploy + reload, so stop polling for it.
	if (timer && status?.configured === false) {
		clearInterval(timer);
		timer = null;
	}
}

export const twitch = {
	get status(): TwitchLiveStatus | null {
		return status;
	}
};

/**
 * Starts polling /api/twitch/live once no matter how many components display
 * the live status. Returns a cleanup function to pass to onMount.
 */
export function startTwitchPolling(): () => void {
	pollers += 1;
	if (!timer) {
		void refresh();
		timer = setInterval(refresh, 60_000);
	}
	let stopped = false;
	return () => {
		if (stopped) return;
		stopped = true;
		pollers -= 1;
		if (pollers === 0 && timer) {
			clearInterval(timer);
			timer = null;
		}
	};
}
