<script lang="ts">
	import type { Anime, Manga } from '$lib/types/aniListMedia';
	import { clamp } from '$lib/utils/clamp';
	import { rgbToHex } from '$lib/utils/rgbToHex';

	export let media: Anime & Manga;

	// Filter out titles that are the same as the preferred title
	let filteredTitles = [
		media.title.english,
		media.title.romaji,
		media.title.native,
		media.title.userPreferred
	].filter((title) => title !== media.title.userPreferred);

	const statusDetails: { [key in typeof media.status]: { text: string; color: string } } = {
		FINISHED: { text: 'Finished', color: '#68D639' },
		RELEASING: { text: 'Releasing', color: '#02A9FF' },
		HIATUS: { text: 'Hiatus', color: '#D2D22D' },
		NOT_YET_RELEASED: { text: 'Not yet released', color: '#F779A4' },
		CANCELLED: { text: 'Cancelled', color: '#E85D75' }
	};

	const mediaFormatDetails: { [key in Anime['format'] | Manga['format']]: { text: string } } = {
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

	function generateAnimeData() {
		let detailsArray: { header: string; text: { value: string; color: string } }[] = [];

		//Status
		detailsArray.push({
			header: 'Status',
			text: { value: statusDetails[media.status].text, color: statusDetails[media.status].color }
		});

		if (media.status !== 'NOT_YET_RELEASED') {
			//Start Date
			detailsArray.push({
				header: 'Start Date',
				text: {
					value: `${media.startDate.day}/${media.startDate.month}/${media.startDate.year}`,
					color: '#FFFFFF'
				}
			});

			//End Date
			if (media.status === 'FINISHED') {
				detailsArray.push({
					header: 'End Date',
					text: {
						value: `${media.endDate.day}/${media.endDate.month}/${media.endDate.year}`,
						color: '#FFFFFF'
					}
				});
			}

			if (media.type === 'MANGA') {
				detailsArray.push({
					header: 'Chapters',
					text: {
						value: media.chapters?.toString() || 'N/A',
						color: '#FFFFFF'
					}
				});

				detailsArray.push({
					header: 'Volumes',
					text: {
						value: media.volumes?.toString() || 'N/A',
						color: '#FFFFFF'
					}
				});
			} else if (media.type === 'ANIME') {
				detailsArray.push({
					header: 'Type',
					text: {
						value: mediaFormatDetails[media.format].text,
						color: '#FFFFFF'
					}
				});

				detailsArray.push({
					header: 'Episodes',
					text: {
						value: media.episodes?.toString() || 'N/A',
						color: '#FFFFFF'
					}
				});

				detailsArray.push({
					header: 'Duration',
					text: {
						value: media.duration?.toString() || 'N/A',
						color: '#FFFFFF'
					}
				});
			}

			detailsArray.push({
				header: 'Rating',
				text: {
					value: media.averageScore?.toString() + '%' || 'N/A',
					color: getGreenRedColorFromScore(media.averageScore || 0)
				}
			});
		}

		return detailsArray;
	}

	function getGreenRedColorFromScore(score: number): string {
		let greenValue = Math.floor((clamp(score * 2, 0, 100) / 100) * 255);
		let redValue = Math.floor((clamp((100 - score) * 2, 0, 100) / 100) * 255);
		return rgbToHex(redValue, greenValue, 0);
	}

	function openLink(url: string) {
		window.open(url, '_blank');
	}
</script>

<div class="flex flex-row box">
	<div class="flex flex-col mr-8">
		<button on:click={() => openLink(media.siteUrl)}>
			<div
				class=" rounded-lg cover-art-container"
				style="border-color: {media.coverImage.color}; background-color: {media.coverImage.color};"
			>
				<img
					class="w-full h-full rounded-lg"
					src={media.coverImage.extraLarge}
					alt={media.title.userPreferred}
				/>
			</div>
		</button>

		<!-- Details -->
		<div class="mt-5">
			{#each generateAnimeData() as detail}
				<p>{detail.header} : <span style="color: {detail.text.color}">{detail.text.value}</span></p>
			{/each}
		</div>

		<!-- Genre -->
		<div class="text-center mt-5">
			{#each media.genres as genre}
				<p style="color : {media.coverImage.color}">{genre}</p>
			{/each}
		</div>
	</div>
	<div class="flex flex-col">
		<!-- Titles -->
		<div class="titles">
			<p class="text-6xl">{media.title.userPreferred}</p>
			{#each filteredTitles as title}
				<p>{title}</p>
			{/each}
		</div>

		<!-- Description -->
		<div>
			<p>{@html media.description}</p>
		</div>

		<!-- BobStats -->
		<div class=" mt-5 space-y-4">
			<p class="text-5xl">BobStats™</p>
			<p style="color: {getGreenRedColorFromScore(media.bobStats.bobscore * 100)};">
				Score : {media.bobStats.bobscore * 10}
			</p>
			<p>{media.bobStats.review}</p>
		</div>
	</div>
</div>

<style lang="postcss">
	.box {
		@apply border border-white rounded-lg;
		width: 80rem;
		background-color: black;
		padding: 2rem;
		z-index: 30;
		border-width: 0.2rem;
	}
	.cover-art-container {
		height: 22rem;
		width: 16rem;

		border-width: 0.3rem;
	}

	.titles {
		@apply mb-10 space-y-2;
	}

	p {
		font-family: 'Cascadia Code';
	}
</style>
