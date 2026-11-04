export function slug(s: string): string {
	return String(s)
		.toLowerCase()
		.replace(/[^a-z0-9_]+/g, '-')
		.replace(/^-|-$/g, '');
}

// Titles become file names, so two titles can't share one and a title with no
// ASCII letters (e.g. Japanese) still needs a name you can type.
export function fileNames(titles: string[], fallback: string, ext: string): string[] {
	const taken = new Set<string>();
	return titles.map((title, i) => {
		const base = slug(title) || `${fallback}-${i + 1}`;
		let name = base;
		for (let n = 2; taken.has(name); n++) name = `${base}-${n}`;
		taken.add(name);
		return name + ext;
	});
}
