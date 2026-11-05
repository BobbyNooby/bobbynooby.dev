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

// The only way the shell touches the page.
/** What happened to a chat message: say only claims it was sent when it was. */
export type ChatSendResult = 'sent' | 'offline' | 'too-fast' | 'invalid';

export type ShellCtx = {
	print(line: Line): void;
	clear(): void;
	focus(pane: PaneKey): void;
	showCat(category: string): void;
	openWindow(win: Win): void;
	openLink(href: string): void;
	sendChat(user: string, msg: string): ChatSendResult;
	rename(user: string): void;
	toast(text: string): void;
	honked(count: number): void;
	onPrompt(reason: 'cd' | 'mode'): void;
	later(fn: () => void, ms: number): void;
	animate(frames: string[], ms: number): void;
	startSnake(): void;
	live(): LiveStatus;
};

export type MountFile = Omit<FileNode, 'type' | 'pane' | 'gridCat'>;
export type Mount = {
	path: string;
	pane: PaneKey;
	gridCat?: string;
	hidden?: boolean;
	locked?: boolean;
	files: () => MountFile[];
};
