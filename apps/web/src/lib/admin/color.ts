// <input type="color"> only takes #rrggbb, while links may store #rgb, #rrggbbaa
// or a colour name. Names have no swatch, so they show white until picked.
export function swatchValue(color: string): string {
	if (/^#[0-9a-f]{3}$/i.test(color)) {
		return '#' + [...color.slice(1)].map((c) => c + c).join('');
	}
	if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(color)) {
		return color.slice(0, 7);
	}
	return '#ffffff';
}
