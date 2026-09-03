export type Link = {
	uid: number;
	label: string;
	href: string;
	color: string;
	// Only meaningful server-side: reassigned from array index on save.
	item_order?: number;
};

export type Project = {
	uid: number;
	title: string;
	description: string;
	href: string;
	// Only meaningful server-side: reassigned from array index on save.
	item_order?: number;
};
