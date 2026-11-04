export type AchKey =
	| 'visit'
	| 'honk'
	| 'say'
	| 'rename'
	| 'tree'
	| 'window'
	| 'media'
	| 'secret'
	| 'sudo'
	| 'live'
	| 'trusted'
	| 'addict'
	| 'snake'
	| 'hunter'
	| 'trivia'
	| 'gacha'
	| 'vim'
	| 'exit'
	| 'konami'
	| 'owl';

export type Achievement = { key: AchKey; name: string; how: string; hidden: boolean };

const row = (key: AchKey, name: string, how: string, hidden = false): Achievement => ({
	key,
	name,
	how,
	hidden
});

// The counter shown everywhere is ACH.length, so adding one here is all it takes.
export const ACH: readonly Achievement[] = [
	row('visit', 'First Visit', 'Open the site.'),
	row('honk', 'First Honk', 'Honk the cat (the logo, or the honk command).'),
	row('say', 'Said Something', 'Post to /Chat with say.'),
	row('rename', 'New Identity', 'Change your name with username.'),
	row('tree', 'Explorer', 'Run tree.'),
	row('window', 'Window Shopper', 'Open a game window.'),
	row('media', 'Curator', 'Open a 3x3 window.'),
	row('secret', 'Nosy', 'Try to get into .secrets/.'),
	row('sudo', 'Sudo Make Me A Sandwich', 'Try sudo.'),
	row('live', 'Front Row', 'Be here when bobby goes live.'),
	row('trusted', 'Trusted', 'Honk 10 times. Opens .secrets/.', true),
	row('addict', 'Honk Addict', 'Honk 25 times.', true),
	row('snake', 'Snake Charmer', 'Score 10 in snake.', true),
	row('hunter', 'Honkalos Slayer', 'Win a hunt.', true),
	row('trivia', 'Know Your Bobby', 'Get 3/3 in trivia.', true),
	row('gacha', 'Gacha Brain', 'Pull 5 times in gacha.', true),
	row('vim', 'Vim Survivor', 'Get out of vim.', true),
	row('exit', 'Exit Strategy', 'Try exit 3 times.', true),
	row('konami', 'Up Up Down Down', 'Enter the Konami code, or tap the title 7 times.', true),
	row('owl', 'Night Owl', 'Visit between 2 and 5am UK time.', true)
];

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export type AchievementStore = {
	has(k: AchKey): boolean;
	unlock(k: AchKey): boolean;
	count(): number;
	honks(): number;
	addHonk(): number;
	trusted(): boolean;
};

const ACH_KEY = 'bsh:ach';
const HONKS_KEY = 'bsh:honks';
const TRUST_HONKS = 10;

export function createAchievementStore(storage: StorageLike | null): AchievementStore {
	// Private mode and blocked storage throw, so every access is guarded and the
	// shell carries on with in-memory progress.
	const read = (key: string): string | null => {
		try {
			return storage?.getItem(key) ?? null;
		} catch {
			return null;
		}
	};
	const write = (key: string, value: string) => {
		try {
			storage?.setItem(key, value);
		} catch {
			// progress just won't survive a reload
		}
	};

	const known = new Set<string>(ACH.map((a) => a.key));
	const unlocked = new Set<AchKey>();
	try {
		const saved: unknown = JSON.parse(read(ACH_KEY) ?? '[]');
		if (Array.isArray(saved)) {
			for (const k of saved) if (typeof k === 'string' && known.has(k)) unlocked.add(k as AchKey);
		}
	} catch {
		// corrupt value: start fresh
	}
	const savedHonks = Number(read(HONKS_KEY));
	let honks = Number.isInteger(savedHonks) && savedHonks > 0 ? savedHonks : 0;

	return {
		has: (k) => unlocked.has(k),
		unlock: (k) => {
			if (unlocked.has(k)) return false;
			unlocked.add(k);
			write(ACH_KEY, JSON.stringify([...unlocked]));
			return true;
		},
		count: () => unlocked.size,
		honks: () => honks,
		addHonk: () => {
			honks++;
			write(HONKS_KEY, String(honks));
			return honks;
		},
		trusted: () => honks >= TRUST_HONKS
	};
}
