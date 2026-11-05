import type { Mount } from '../types';

export function homeMount(): Mount {
	return {
		path: '',
		pane: 'about',
		files: () => [
			{
				name: 'about_me.txt',
				lines: () => [
					[{ t: 'Welcome to my small corner of the internet!', c: '#facc15' }],
					[
						{
							t: 'This site is my { blog / status / portfolio }, mostly to show off what I { have been / am currently } up to.'
						}
					],
					[
						{
							t: 'Main languages: JavaScript / TypeScript / English. Favourite framework: Svelte.'
						}
					],
					[
						{ t: 'Find me in ' },
						{ t: 'links/', c: '#60a5fa', run: 'ls ~/links' },
						{ t: ', or say hi with ' },
						{ t: 'say <msg>', c: '#4ade80' }
					]
				]
			}
		]
	};
}

export function blogMount(): Mount {
	return { path: 'blog', pane: 'about', files: () => [] };
}
