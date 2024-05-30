import { chatClient } from '$lib/supabaseChat';
import type { chatMessageSchema } from '$lib/types/chatMessageSchema';
import { playAudio } from '$lib/utils/playAudio';
import { staticFilesUrl } from '$lib/utils/staticContentDirectory';
import { get, writable } from 'svelte/store';

export function createMessageStore(data: chatMessageSchema[] = []) {
	const messages = data;

	const { subscribe, update, set } = writable(messages);

	return {
		subscribe,
		update,
		set,
		sendMessage: async ({ name, message }: { name: string; message: string }): Promise<boolean> => {
			const formData = new FormData();

			let submitName = name;
			let submitMessage = message.replace(/\s+/g, ' ').trim();

			formData.append('messageData', JSON.stringify({ name: submitName, message: submitMessage }));

			if (submitMessage.slice(0, 5).toLowerCase() == '/nick') {
				let username = submitMessage.slice(6);

				localStorage.setItem('username', username);
				return true;
			}

			const { type } = await fetch('?/sendMessage', {
				method: 'POST',
				body: formData
			}).then((res) => res.json());

			if (type === 'failure') {
				return false;
			}

			playAudio(`${staticFilesUrl}/AOL/imsend.mp3`);
			return true;
		},
		updateMessages: async (latestMessage: chatMessageSchema) => {
			const { data, error } = await chatClient
				.from('messages')
				.select()
				.order('created_at', { ascending: true });

			if (error) {
				return [];
			}

			if (
				Object.keys(latestMessage).length > 0 &&
				latestMessage.name != localStorage.getItem('username')
			) {
				playAudio(`${staticFilesUrl}/AOL/imrcv.mp3`);
			}

			set(data as chatMessageSchema[]);

			setTimeout(() => {
				const chatbox = document.getElementById('chatbox') as HTMLDivElement;
				chatbox.scrollTop = chatbox.scrollHeight;
			}, 1);
		}
	};
}
