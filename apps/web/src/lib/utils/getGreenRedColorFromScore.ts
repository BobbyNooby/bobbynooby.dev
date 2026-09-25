import { clamp } from './clamp';
import { rgbToHex } from './rgbToHex';

export function getGreenRedColorFromScore(score: number): string {
	let greenValue = Math.floor((clamp(score * 2, 0, 100) / 100) * 255);
	let redValue = Math.floor((clamp((100 - score) * 2, 0, 100) / 100) * 255);
	return rgbToHex(redValue, greenValue, 0);
}
