export function generalParse(string: string): number | string | boolean | undefined {
	if (!isNaN(parseFloat(string))) {
		return parseFloat(string);
	} else if (!isNaN(parseInt(string))) {
		return parseInt(string);
	} else if (['true', 'false'].includes(string.toLowerCase())) {
		return string.toLowerCase() === 'true' ? true : false;
	} else {
		return string;
	}
}
