export type Segment = { t: string; c?: string; href?: string; run?: string; fx?: true };
export type Line = Segment[];

export type PaneKey =
	| 'about'
	| 'projects'
	| 'games'
	| 'chat'
	| 'links'
	| 'status'
	| 'music'
	| 'grid'
	| 'twitch';

export type BshLink = { label: string; href: string; color: string };
export type BshProject = { title: string; description: string; href: string };
export type BshGame = {
	appid: number;
	name: string;
	hours: number;
	lastPlayed: number | null;
	genres?: string[];
	releaseDate?: string | null;
	achievements?: { unlocked: number; total: number } | null;
};
export type BshMedia = {
	label: string;
	anilistId: number | string | null;
	review: string | null;
	title: string | null;
	cover: string | null;
	color: string | null;
};
export type BshLastPlayed = {
	isPlaying: boolean;
	title: string;
	artist: string;
	album: string;
	songUrl: string;
	playedAt: string;
};
export type BshData = {
	links: BshLink[];
	projects: BshProject[];
	games: BshGame[];
	lastPlayed: BshLastPlayed | null;
	threeByThree: Record<string, BshMedia[]>;
};

export type LiveStatus = {
	discord: 'online' | 'idle' | 'dnd' | 'offline';
	twitchLive: boolean;
	playing: boolean;
};

export type Win =
	| { kind: 'game'; game: BshGame }
	| { kind: 'media'; media: BshMedia; category: string; index: number };

export type FileNode = {
	type: 'file';
	name: string;
	pane: PaneKey;
	gridCat?: string;
	lines: () => Line[];
	href?: string;
	win?: Win;
};
export type DirNode = {
	type: 'dir';
	pane: PaneKey;
	kids: Record<string, FsNode>;
	gridCat?: string;
	hidden?: boolean;
	locked?: boolean;
};
export type FsNode = FileNode | DirNode;

export type MountFile = Omit<FileNode, 'type' | 'pane' | 'gridCat'>;
export type Mount = {
	path: string;
	pane: PaneKey;
	gridCat?: string;
	hidden?: boolean;
	locked?: boolean;
	files: () => MountFile[];
};
