export function rgbToHex(r: number, g: number, b: number): string {
	const componentToHex = (c) => {
		const hex = c.toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};
	const hexR = componentToHex(r);
	const hexG = componentToHex(g);
	const hexB = componentToHex(b);
	return `#${hexR}${hexG}${hexB}`;
}
