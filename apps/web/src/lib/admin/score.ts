// bobscore is stored 0-1 and shown out of 10 on the site (0.9 -> 9.0).

export function toTen(bobscore: number): string {
	return (bobscore * 10).toFixed(1);
}

export function fromTen(input: string): number {
	if (input.trim() === '') return NaN;
	return Math.round(Number(input) * 10) / 100;
}
