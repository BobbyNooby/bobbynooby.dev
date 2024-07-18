import {
	errorAnime,
	errorManga,
	type Anime,
	type Manga,
	type MediaQuery
} from './types/aniListMedia';

export async function getMedia(mediaId: number): Promise<MediaQuery | null> {
	const query = `
    query ($id: Int) {
        Media(id:$id) {
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

export async function getManga(mangaId: number): Promise<Manga> {
	const manga = await getMedia(mangaId);

	if (manga == null) {
		return errorManga;
	} else {
		return manga;
	}
}

export async function getAnime(animeId: number): Promise<Anime> {
	const anime = await getMedia(animeId);

	if (anime == null) {
		return errorAnime;
	} else {
		return anime;
	}
}
