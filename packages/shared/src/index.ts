import { z } from 'zod';

export { createTokenBucket, type TokenBucket } from './tokenBucket';
export { pickForwardedIp } from './forwardedIp';

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

export type UserCountPayload = {
	userCount: number;
};

export const chatIntakeSchema = z.object({
	name: z.string().min(1).max(50),
	message: z.string().min(1).max(10_000)
});

export type ChatIntake = z.infer<typeof chatIntakeSchema>;
