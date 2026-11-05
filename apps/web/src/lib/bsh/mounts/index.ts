import type { BshData, Mount } from '../types';
import { gamesMount } from './games';
import { gridMounts } from './grid';
import { blogMount, homeMount } from './home';
import { chatMount, statusMount } from './live';
import { musicMount } from './music';
import { secretsMount } from './secrets';
import { linksMount, projectsMount } from './site';
import type { MountEnv } from './types';

// One mount per folder, in the order ls shows them. Lines are built when a
// file is read, so status files always show the value right now.
export function createMounts(data: BshData, env: MountEnv): Mount[] {
	return [
		homeMount(),
		projectsMount(data),
		linksMount(data),
		gamesMount(data, env),
		...gridMounts(data),
		musicMount(data, env),
		statusMount(env),
		chatMount(),
		blogMount(),
		secretsMount()
	];
}

export { HIDDEN_COMMANDS } from './secrets';
export type { MountEnv } from './types';
