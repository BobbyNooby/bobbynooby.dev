import { errorAnime, errorManga, type Anime, type Manga, type MediaQuery } from './anilistTypes';

// Shared field list: used by the single-media query here and by the batched
// aliased queries in mediaCache.ts.
export const MEDIA_FIELDS = `
    id
    title {
        romaji
        english
        native
        userPreferred
    }
    type
    format
    status
    startDate {
        year
        month
        day
    }
    endDate {
        year
        month
        day
    }
    chapters
    volumes
    episodes
    duration
    description
    coverImage {
        extraLarge
        large
        medium
        color
    }
    genres
    averageScore
    siteUrl
`;

export async function getMedia(mediaId: string | number): Promise<MediaQuery | null> {
	const query = `
    query ($id: Int) {
        Media(id:$id) {
            ${MEDIA_FIELDS}
        }
    }
    `;

	const variables = {
		id: mediaId
	};

	const url = 'https://graphql.anilist.co',
		options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: JSON.stringify({
				query,
				variables
			})
		};

	const { data } = await fetch(url, options).then((response) => response.json());

	if (data == null) {
		return null;
	} else {
		return data.Media;
	}
}

export async function getManga(mangaId: string | number): Promise<Manga> {
	const manga = await getMedia(mangaId);

	if (manga == null) {
		return errorManga;
	} else {
		return manga;
	}
}

export async function getAnime(animeId: string | number): Promise<Anime> {
	const anime = await getMedia(animeId);

	if (anime == null) {
		return errorAnime;
	} else {
		return anime;
	}
}
