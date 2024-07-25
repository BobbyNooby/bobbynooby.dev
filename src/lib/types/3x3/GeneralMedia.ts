import type { TextObject } from '../TextObject';

export type GeneralMedia = {
	color: string;
	coverImageURL: string;
	details: { category: TextObject; text: TextObject }[];
	titles: TextObject[];
	genres: string[];
	description: string;
	bobStats: { review: string; score: number };
	url: string;
	css: { outer: string; inner: string };
};

export const noneGeneralMedia: GeneralMedia = {
	color: '#FFFFFF',
	coverImageURL: '',
	details: [],
	titles: [],
	genres: [],
	description: '',
	bobStats: { review: '', score: 0 },
	url: 'https://bobbynooby.dev',
	css: { outer: 'height : 10rem; width : 10rem', inner: ' height : 10rem; width : 10rem' }
};
