import { z } from 'zod';
import { cleanText } from './text';

export { createTokenBucket, type TokenBucket } from './tokenBucket';
export { pickForwardedIp } from './forwardedIp';
export { createConnectionLimiter, type ConnectionLimiter } from './connectionLimiter';
export {
	PANE_KEYS,
	PRESENCE_NAME_MAX_LENGTH,
	presenceClientMessageSchema,
	presenceCurSchema,
	presenceHelloSchema,
	presenceHideSchema,
	type PaneKey,
	type PresenceClientMessage,
	type PresenceCur,
	type PresenceCursor,
	type PresenceHello,
	type PresenceHide,
	type PresenceState
} from './presence';
export { createPresenceRegistry, type PresenceRegistry } from './presenceRegistry';
export { cleanText } from './text';

export type DiscordStatus = 'online' | 'idle' | 'dnd' | 'offline' | 'unknown';

export type SpotifySongData = {
	isPlaying: boolean;
	title: string;
	artist: string;
	album: string;
	albumImageUrl: string;
	songUrl: string;
};

export type SpotifyLastPlayedData = SpotifySongData & { playedAt: string };

export type ChatMessage = {
	name: string;
	created_at: string;
	message: string;
	rank: string;
};

export type ReceivedChatMessage = {
	name: string;
	message: string;
};

// Leaves room for the name prefix inside Discord's 2000-character limit, and
// keeps a full 500-message history near 1MB per connection.
export const CHAT_MAX_MESSAGE_LENGTH = 1900;

export const chatIntakeSchema = z.object({
	name: z.string().overwrite(cleanText).min(1).max(50),
	message: z.string().overwrite(cleanText).min(1).max(CHAT_MAX_MESSAGE_LENGTH)
});

export type ChatIntake = z.infer<typeof chatIntakeSchema>;
