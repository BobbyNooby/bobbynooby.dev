import type { ChatMessage } from '$lib/types';
import { createLiveSocket, type LiveSocket } from '$lib/utils/liveSocket';
import { playAudio } from '$lib/utils/playAudio';
import { chatIntakeSchema } from '@bobbynooby/shared';

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

function storedName(): string {
	try {
		const saved = localStorage.getItem('username');
		if (saved) return saved;
		const fresh = `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
		localStorage.setItem('username', fresh);
		return fresh;
	} catch {
		return `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
	}
}

// The /chat socket and the username, shared by the chat pane and the shell's say/username.
export class ChatState {
	messages = $state<ChatMessage[]>([]);
	username = $state('Guest');
	#ws: LiveSocket | null = null;
	#lastSent = { name: '', message: '' };

	start(): () => void {
		this.username = storedName();
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
		this.send(this.username, text);
	}

	send(name: string, message: string) {
		const check = chatIntakeSchema.safeParse({ name, message });
		if (!check.success) return this.note('That message is too long to send.');
		this.#lastSent = check.data;
		this.#ws?.send(JSON.stringify(check.data));
	}

	rename(name: string) {
		const clean = name.trim().slice(0, 24);
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
