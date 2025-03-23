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
