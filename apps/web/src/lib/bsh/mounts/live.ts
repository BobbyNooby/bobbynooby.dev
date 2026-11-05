import type { Mount } from '../types';
import type { MountEnv } from './types';

const DISCORD = { online: '#23A55A', idle: '#F0B232', dnd: '#F23F43', offline: '#80848E' };

// Files whose lines are read from the live sockets each time they are opened.

export function statusMount(env: MountEnv): Mount {
	return {
		path: 'status',
		pane: 'status',
		files: () => [
			{
				name: 'discord.txt',
				lines: () => {
					const { discord } = env.live();
					return [[{ t: discord + '.sh', c: DISCORD[discord] }]];
				}
			},
			{
				name: 'twitch.txt',
				lines: () => {
					const live = env.live().twitchLive;
					return [[{ t: live ? 'live' : 'offline', c: live ? '#a970ff' : '#9ca3af' }]];
				}
			},
			{
				name: 'time.txt',
				lines: () => {
					const now = env.now();
					return [
						[{ t: 'UK  ' + now.toLocaleString('en-GB', { timeZone: 'Europe/London' }) }],
						[{ t: 'MY  ' + now.toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' }) }]
					];
				}
			}
		]
	};
}

export function chatMount(): Mount {
	return {
		path: 'chat',
		pane: 'chat',
		files: () => [
			{
				name: 'README.txt',
				lines: () => [
					[
						{ t: 'This room is live. ' },
						{ t: 'say <msg>', c: '#4ade80' },
						{ t: ' to talk, ' },
						{ t: 'username <name>', c: '#4ade80' },
						{ t: ' to rename (in the chat box it is /username).' }
					]
				]
			}
		]
	};
}
