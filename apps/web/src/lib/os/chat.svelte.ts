import type { StorageLike } from '$lib/bsh/achievements';
import type { ChatSendResult } from '$lib/bsh/types';
import type { ChatMessage } from '$lib/types';
import { createLiveSocket, type LiveSocket } from '$lib/utils/liveSocket';
import { playAudio } from '$lib/utils/playAudio';
import { chatIntakeSchema, createTokenBucket } from '@bobbynooby/shared';

const STARTERS = [
	'Welcome to the chat! Use /username to change your username.',
	'If the name is green, its me! If not, its someone else.'
];

const system = (message: string): ChatMessage => ({
	name: 'bobbynooby.dev',
	message,
	rank: 'system',
	created_at: new Date().toISOString()
});

const MAX_NAME = 24;

const SEND_NOTES: Record<Exclude<ChatSendResult, 'sent'>, string> = {
	offline: '/Chat is reconnecting. Try again in a moment.',
	'too-fast': 'Slow down: chat takes 5 messages, then one every 2 seconds.',
	invalid: 'That message is too long to send.'
};
const guest = () => `Guest_${Math.floor(1000 + Math.random() * 9000)}`;

// The saved chat name, capped like the shell's (old chat boxes allowed any length).
export function loadUsername(storage: StorageLike | null): string {
	try {
		const saved = storage?.getItem('username')?.trim().slice(0, MAX_NAME);
		if (saved) return saved;
		const fresh = guest();
		storage?.setItem('username', fresh);
		return fresh;
	} catch {
		return guest();
	}
}

function browserStorage(): StorageLike | null {
	try {
		return localStorage;
	} catch {
		return null;
	}
}

// The /chat socket and the username, shared by the chat pane and the shell's say/username.
export class ChatState {
	messages = $state<ChatMessage[]>([]);
	username = $state('Guest');
	#ws: LiveSocket | null = null;
	#lastSent = { name: '', message: '' };
	// Same limits as the server's bucket, so a message it would drop is reported here.
	#bucket = createTokenBucket({ capacity: 5, refillPerSecond: 0.5 });

	start(): () => void {
		this.username = loadUsername(browserStorage());
		this.#ws = createLiveSocket<{ initialMessages: ChatMessage[] } | { message: ChatMessage }>(
			'/chat',
			(data) => {
				if ('initialMessages' in data) {
					// History arrives oldest-first; the welcome lines stay last so they read as newest.
					this.messages = [...data.initialMessages, ...STARTERS.map(system)];
					return;
				}
				this.messages = [...this.messages, data.message];
				const mine =
					this.#lastSent.name === data.message.name &&
					this.#lastSent.message === data.message.message;
				playAudio(mine ? '/imsend.mp3' : '/imrcv.mp3');
			}
		);
		return () => this.#ws?.close();
	}

	// The chat box: /username renames, any other /word is unknown, the rest is a message.
	submit(raw: string) {
		const text = raw.trim();
		if (!text) return;
		const [command, ...rest] = text.split(/\s+/);
		if (command === '/username') return this.rename(rest.join(' '));
		if (command.startsWith('/')) return this.note(`Command ${command} not found`);
		const result = this.send(this.username, text);
		if (result !== 'sent') this.note(SEND_NOTES[result]);
	}

	send(name: string, message: string): ChatSendResult {
		const check = chatIntakeSchema.safeParse({ name, message });
		if (!check.success) return 'invalid';
		if (!this.#ws?.isOpen()) return 'offline';
		if (!this.#bucket.tryTake()) return 'too-fast';
		this.#lastSent = check.data;
		this.#ws.send(JSON.stringify(check.data));
		return 'sent';
	}

	rename(name: string) {
		const clean = name.trim().slice(0, MAX_NAME);
		if (!clean) return this.note('Usage: /username <name>');
		this.username = clean;
		try {
			localStorage.setItem('username', clean);
		} catch {
			// private mode: the name still applies for this visit
		}
		this.note(`Username changed to ${clean}`);
	}

	note(message: string) {
		this.messages = [...this.messages, system(message)];
	}
}
