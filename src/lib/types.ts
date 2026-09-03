export type TextObject = {
	value: string;
	color: string;
};
export type threeByThreeEntry = {
	uid: number;
	// AniList media id. Stored as a number in Mongo for older rows, as a
	// string for rows created through the admin UI — both work with the API.
	id: string | number;
	review: string;
	label: string;
	// Only meaningful server-side: reassigned from array index on save.
	item_order?: number;
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
};
