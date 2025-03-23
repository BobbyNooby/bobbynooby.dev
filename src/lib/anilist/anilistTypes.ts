type MediaIdentifiers = {
	id: number;
	title: {
		romaji: string;
		english: string;
		native: string;
		userPreferred: string;
	};
	type: 'MANGA' | 'ANIME';
	format:
		| 'MANGA'
		| 'TV'
		| 'TV_SHORT'
		| 'MOVIE'
		| 'SPECIAL'
		| 'OVA'
		| 'ONA'
		| 'MUSIC'
		| 'NOVEL'
		| 'ONE_SHOT';
	status: 'FINISHED' | 'RELEASING' | 'HIATUS' | 'NOT_YET_RELEASED' | 'CANCELLED';
	startDate: {
		year: number;
		month: number;
		day: number;
	};
	endDate: {
		year: number | null;
		month: number | null;
		day: number | null;
	};
	description: string;
	coverImage: {
		extraLarge: string;
		large: string;
		medium: string;
		color: string;
	};
	genres: string[];
	averageScore: number;
	siteUrl: string;
	bobStats: {
		review: string;
		bobscore: number;
	};
};

export type Manga = MediaIdentifiers & {
	chapters: number | null;
	volumes: number | null;
};

export type Anime = MediaIdentifiers & { episodes: number | null; duration: number | null };

export type MediaQuery = Manga & Anime;

export const errorManga: Manga = {
	id: 0,
	title: {
		romaji: 'Manga Data Shutoku Ji No Error',
		english: 'Error In Getting Manga Data',
		native: 'マンガデータ取得時のエラー',
		userPreferred: 'Error In Getting Manga Data'
	},
	type: 'MANGA',
	format: 'MANGA',
	status: 'HIATUS',
	startDate: {
		year: 0,
		month: 0,
		day: 0
	},
	endDate: {
		year: 0,
		month: 0,
		day: 0
	},
	chapters: 0,
	volumes: 0,
	description: '',
	coverImage: {
		extraLarge: '',
		large: '',
		medium: '',
		color: ''
	},
	genres: [],
	averageScore: 0,
	siteUrl: 'https://bobbynooby.dev',
	bobStats: {
		review: '',
		bobscore: 0
	}
};

export const errorAnime: Anime = {
	id: 0,
	title: {
		romaji: 'Anime Data Shutoku Ji No Error',
		english: 'Error In Getting Anime Data',
		native: 'アニメデータ取得時のエラー',
		userPreferred: 'Error In Getting Anime Data'
	},
	type: 'ANIME',
	format: 'MANGA',
	status: 'HIATUS',
	startDate: {
		year: 0,
		month: 0,
		day: 0
	},
	endDate: {
		year: 0,
		month: 0,
		day: 0
	},
	episodes: 0,
	duration: 0,
	description: '',
	coverImage: {
		extraLarge: '',
		large: '',
		medium: '',
		color: ''
	},
	genres: [],
	averageScore: 0,
	siteUrl: 'https://bobbynooby.dev',
	bobStats: {
		review: '',
		bobscore: 0
	}
};
