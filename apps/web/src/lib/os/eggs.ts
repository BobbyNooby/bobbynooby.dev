export const KONAMI = [
	'arrowup',
	'arrowup',
	'arrowdown',
	'arrowdown',
	'arrowleft',
	'arrowright',
	'arrowleft',
	'arrowright',
	'b',
	'a'
];

// How far into the code the visitor is after this key (KONAMI.length = done).
export function konamiStep(pos: number, key: string): number {
	const k = key.toLowerCase();
	if (k === KONAMI[pos]) return pos + 1;
	if (k === 'arrowup') return pos === 2 ? 2 : 1;
	return 0;
}

const TAP_GAP_MS = 1500;
const TAPS = 7;

// Seven taps on the title, each within 1.5s of the last.
export function createTitleTaps(): (now: number) => boolean {
	let count = 0;
	let last = -Infinity;
	return (now) => {
		count = now - last <= TAP_GAP_MS ? count + 1 : 1;
		last = now;
		if (count < TAPS) return false;
		count = 0;
		return true;
	};
}

export function isNightOwl(now: Date): boolean {
	const hour = Number(
		new Intl.DateTimeFormat('en-GB', {
			timeZone: 'Europe/London',
			hour: '2-digit',
			hourCycle: 'h23'
		}).format(now)
	);
	return hour >= 2 && hour < 5;
}
