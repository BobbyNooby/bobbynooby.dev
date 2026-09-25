// Rank -> name color for the chat box. Unknown ranks fall back to guest gray.
export const chatRankColors: Record<string, string> = {
	system: '#FDE047',
	owner: '#00FF00',
	guest: '#CECECE'
};

export function chatColorForRank(rank: string): string {
	return chatRankColors[rank] ?? chatRankColors.guest;
}
