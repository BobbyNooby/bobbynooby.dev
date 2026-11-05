// bobscore is stored 0-1 and shown out of 10 on the site (0.9 -> 9.0).

export function toTen(bobscore: number): string {
	return (bobscore * 10).toFixed(1);
}

// Plain decimal text only: Number() would also take '0x10', '1e1' and '-1'.
// The 0-10 range is left to the save rules so an 11 still shows as typed.
export function fromTen(input: string): number {
	const text = input.trim();
	if (!/^\d+\.?\d*$/.test(text)) return NaN;
	return Math.round(Number(text) * 10) / 100;
}
