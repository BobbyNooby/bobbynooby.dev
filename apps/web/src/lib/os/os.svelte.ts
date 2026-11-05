import type { PaneKey } from '$lib/bsh/types';
import { getContext, setContext } from 'svelte';
import type { ChatState } from './chat.svelte';
import type { LiveState } from './live.svelte';
import type { PresenceState } from './presence.svelte';

export type OsWindow =
	| { kind: 'game'; appid: number }
	| { kind: 'media'; category: string; index: number };

export class OsState {
	focused = $state<PaneKey>('about');
	win = $state<OsWindow | null>(null);
	phosphor = $state(false);
	gridCat = $state('anime');
	toastText = $state('');
	toastShown = $state(false);
	#toastTimer: ReturnType<typeof setTimeout> | undefined;

	focus(pane: PaneKey, scroll = false) {
		this.focused = pane;
		if (scroll && typeof document !== 'undefined') {
			document
				.querySelector(`[data-pane="${pane}"]`)
				?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		}
	}

	toast(text: string) {
		this.toastText = text;
		this.toastShown = true;
		clearTimeout(this.#toastTimer);
		this.#toastTimer = setTimeout(() => (this.toastShown = false), 2600);
	}
}

export type OsContext = {
	os: OsState;
	live: LiveState;
	chat: ChatState;
	presence: PresenceState;
};

const KEY = Symbol('bobbyos');

export function setOsContext(ctx: OsContext): OsContext {
	return setContext(KEY, ctx);
}

export function useOs(): OsContext {
	return getContext<OsContext>(KEY);
}
