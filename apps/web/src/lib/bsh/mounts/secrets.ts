import type { Mount } from '../types';

/** The hidden games, as listed (and tappable) in .secrets/games.txt. */
export const HIDDEN_COMMANDS = [
	'snake',
	'hunt',
	'trivia',
	'gacha',
	'fortune',
	'catsay hi',
	'nmap',
	'sl',
	'vim'
];

/** Hidden from ls, and locked until 10 honks make the cat trust you. */
export function secretsMount(): Mount {
	return {
		path: '.secrets',
		pane: 'about',
		hidden: true,
		locked: true,
		files: () => [
			{
				name: 'games.txt',
				lines: () => [
					[{ t: 'commands that are not in help:', c: '#f472b6' }],
					HIDDEN_COMMANDS.flatMap((c, i) => [
						...(i ? [{ t: '  ' }] : []),
						{ t: c, c: '#4ade80', run: c }
					]),
					[{ t: 'also try: sudo (a few times), rm -rf /, exit (3 times), coffee', c: '#9ca3af' }],
					[{ t: '↑ ↑ ↓ ↓ ← → ← → B A   (on a phone, tap the title 7 times)', c: '#facc15' }]
				]
			},
			{
				name: 'credits.txt',
				lines: () => [
					[
						{ t: 'built by bobby. inspired by ' },
						{ t: 'dimden.dev', href: 'https://dimden.dev' },
						{ t: '. shell: bsh 0.1.' }
					]
				]
			}
		]
	};
}
