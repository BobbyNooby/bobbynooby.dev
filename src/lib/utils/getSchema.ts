export function getSchema(data: {}[]) {
	const firstData = data[0];
	return Object.keys(firstData);
}
