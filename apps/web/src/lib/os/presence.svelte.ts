import { createLiveSocket } from '$lib/utils/liveSocket';

// Visitor count for the bar and /Chat.
export class PresenceState {
	here = $state(0);

	start(): () => void {
		const socket = createLiveSocket<{ userCount: number }>('/userCount', ({ userCount }) => {
			this.here = userCount;
		});
		return () => socket.close();
	}
}
