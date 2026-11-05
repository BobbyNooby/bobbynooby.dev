import type { BshMedia } from '$lib/bsh/types';
import { db } from '$lib/db/mongo';
import type { threeByThreeEntry } from '$lib/types';
import type { GeneralMedia } from './mediaTypes';
import { parseMedia } from './parseMedia';
import { plainText } from './plainText';

// A 3x3 tile: what the shell needs (BshMedia) plus what its window shows.
export type GridEntry = BshMedia & {
	url: string | null;
	altTitles: string[];
	score: number;
	genres: string[];
	details: { label: string; value: string; color: string }[];
	description: string;
};

export function toGridEntry(entry: threeByThreeEntry, media: GeneralMedia): GridEntry {
	const [first, ...rest] = media.titles.map((t) => t.value);
	const altTitles = [...new Set(rest.filter((t) => t && t !== first))];
	return {
		label: entry.label,
		anilistId: entry.id,
		review: entry.review || null,
		title: first || null,
		cover: media.coverImageURL || null,
		color: media.color || null,
		url: media.url || null,
		altTitles,
		score: media.bobStats.score,
		genres: media.genres ?? [],
		details: media.details.map((d) => ({
			label: d.category.value,
			value: d.text.value,
			color: d.text.color
		})),
		description: plainText(media.description)
	};
}

// The first nine entries of every 3x3 route, same order and source as /3x3/[category].
export async function loadHomeGrid(): Promise<Record<string, GridEntry[]>> {
	const routeDoc = await db
		.collection<{ routes: string[] }>('3x3_dynamic_routes')
		.findOne({}, { projection: { _id: 0, routes: 1 } });
	const routes = [...new Set((routeDoc?.routes ?? []).map((r) => r.toLowerCase()))];
	const grids = await Promise.all(
		routes.map(async (category) => {
			const entries = await db
				.collection<threeByThreeEntry>('3x3_' + category)
				.find({}, { projection: { _id: 0 }, sort: { item_order: 1 }, limit: 9 })
				.toArray();
			const items = await Promise.all(
				entries.map(async (entry) => {
					const media = await parseMedia(entry, category);
					return media ? toGridEntry(entry, media) : null;
				})
			);
			return [category, items.filter((i): i is GridEntry => i !== null)] as const;
		})
	);
	return Object.fromEntries(grids);
}
