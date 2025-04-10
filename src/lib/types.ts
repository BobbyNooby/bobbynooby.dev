export type TextObject = {
	value: string;
	color: string;
};
export type threeByThreeEntry = {
	id: string;
	review: string;
	label: string;
	item_order: number;
	bobscore: number;
};

export type threeByThreeServerData = {
	label: string;
	data: threeByThreeEntry[];
};

export type ShortURL = {
	shortURL: string;
	longURL: string;
};

export type ChatMessage = {
	created_at: string;
	name: string;
	message: string;
	rank: string;
};

export type SentChatMessage = {
	name: string;
	message: string;
	sessionId: string | undefined;
};
