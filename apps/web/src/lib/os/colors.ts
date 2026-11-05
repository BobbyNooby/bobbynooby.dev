import type { discordStatuses } from '$lib/discord/discordTypes';

export const DISCORD_COLORS: Record<discordStatuses, string> = {
	online: '#23A55A',
	idle: '#F0B232',
	dnd: '#F23F43',
	offline: '#80848E',
	unknown: '#80848E'
};

// Dark text on light tiles, light text on dark ones.
export function inkFor(hex: string | null): string {
	const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
	if (!m) return '#f5f5f5';
	const n = parseInt(m[1], 16);
	const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
	return lum > 0.6 ? '#111111' : '#ffffff';
}
