import { getAnime, getManga } from '$lib/anilist';
import MediaDetails from '$lib/components/MediaDetails.svelte';
import type { Anime, Manga, threeByThreeEntry } from '$lib/types/3x3/aniListMedia';
import { noneGeneralMedia, type GeneralMedia } from '$lib/types/3x3/GeneralMedia';
import type { TextObject } from '$lib/types/TextObject';
import { getGreenRedColorFromScore } from '$lib/utils/getGreenRedColorFromScore';
import { text } from '@sveltejs/kit';

export async function parseMedia(
	entry: threeByThreeEntry,
	category: string
): Promise<GeneralMedia | null> {
	if (category == 'anime') {
		let anime = await getAnime(entry.id);
		anime['bobStats'] = { review: entry.review, bobscore: entry.bobscore };
		const generalMediaEntry = parseAnilistMedia(anime as Anime & Manga);
		return generalMediaEntry;
	} else if (category == 'manga') {
		let manga = await getManga(entry.id);
		manga['bobStats'] = { review: entry.review, bobscore: entry.bobscore };
		const generalMediaEntry = parseAnilistMedia(manga as Anime & Manga);
		return generalMediaEntry;
	} else {
		return null;
	}
}

const anilistStatusDetails: {
	[key in Anime['status'] | Manga['status']]: { text: string; color: string };
} = {
	FINISHED: { text: 'Finished', color: '#68D639' },
	RELEASING: { text: 'Releasing', color: '#02A9FF' },
	HIATUS: { text: 'Hiatus', color: '#D2D22D' },
	NOT_YET_RELEASED: { text: 'Not yet released', color: '#F779A4' },
	CANCELLED: { text: 'Cancelled', color: '#E85D75' }
};

const anilistFormatDetails: { [key in Anime['format'] | Manga['format']]: { text: string } } = {
	MANGA: { text: 'Manga' },
	TV: { text: 'TV' },
	TV_SHORT: { text: 'TV Short' },
	MOVIE: { text: 'Movie' },
	SPECIAL: { text: 'Special' },
	ONE_SHOT: { text: 'One-shot' },
	OVA: { text: 'OVA' },
	ONA: { text: 'ONA' },
	NOVEL: { text: 'Novel' },
	MUSIC: { text: 'Music' }
};

function parseAnilistMedia(media: Anime & Manga): GeneralMedia {
	const returnMedia: GeneralMedia = {
		color: media.coverImage.color,
		bobStats: {
			review: media.bobStats.review,
			score: media.bobStats.bobscore
		},
		coverImageURL: media.coverImage.extraLarge,
		description: media.description,
		genres: media.genres,
		url: media.siteUrl,
		titles: [
			{
				value: media.title.userPreferred,
				color: '#FFFFFF'
			},
			...[media.title.english, media.title.romaji, media.title.native, media.title.userPreferred]
				.filter((title) => title !== media.title.userPreferred)
				.map((title) => ({
					value: title,
					color: '#FFFFFF'
				}))
		],
		details: [],
		css: { outer: 'height : 18rem; width : 12rem;', inner: 'height : 22rem; width : 16rem;' }
	};

	returnMedia.details.push({
		category: { value: 'Status', color: '#FFFFFF' },
		text: {
			value: anilistStatusDetails[media.status].text,
			color: anilistStatusDetails[media.status].color
		}
	});

	if (media.status !== 'NOT_YET_RELEASED') {
		if (media.format === 'MOVIE') {
			returnMedia.details.push({
				category: { value: 'Release Date', color: '#FFFFFF' },
				text: {
					value: `${media.startDate.day}/${media.startDate.month}/${media.startDate.year}`,
					color: '#FFFFFF'
				}
			});
		} else {
			returnMedia.details.push({
				category: { value: 'Start Date', color: '#FFFFFF' },
				text: {
					value: `${media.startDate.day}/${media.startDate.month}/${media.startDate.year}`,
					color: '#FFFFFF'
				}
			});

			if (media.status === 'FINISHED') {
				returnMedia.details.push({
					category: { value: 'End Date', color: '#FFFFFF' },
					text: {
						value: `${media.endDate.day}/${media.endDate.month}/${media.endDate.year}`,
						color: '#FFFFFF'
					}
				});
			}
		}

		if (media.type == 'MANGA') {
			returnMedia.details.push({
				category: { value: 'Chapters', color: '#FFFFFF' },
				text: { value: media.chapters?.toString() || 'N/A', color: '#FFFFFF' }
			});

			returnMedia.details.push({
				category: { value: 'Volumes', color: '#FFFFFF' },
				text: { value: media.volumes?.toString() || 'N/A', color: '#FFFFFF' }
			});
		} else if (media.type == 'ANIME') {
			returnMedia.details.push({
				category: { value: 'Type', color: '#FFFFFF' },
				text: {
					value: anilistFormatDetails[media.format].text,
					color: '#FFFFFF'
				}
			});

			returnMedia.details.push({
				category: { value: 'Episodes', color: '#FFFFFF' },
				text: { value: media.episodes?.toString() || 'N/A', color: '#FFFFFF' }
			});

			returnMedia.details.push({
				category: { value: 'Duration', color: '#FFFFFF' },
				text: {
					value: media.duration ? media.duration.toString() + ' minutes' : 'N/A',
					color: '#FFFFFF'
				}
			});
		}

		returnMedia.details.push({
			category: { value: 'Rating', color: '#FFFFFF' },
			text: {
				value: media.averageScore?.toString() || 'N/A',
				color: getGreenRedColorFromScore(media.averageScore || 0)
			}
		});
	}

	return returnMedia;
}
