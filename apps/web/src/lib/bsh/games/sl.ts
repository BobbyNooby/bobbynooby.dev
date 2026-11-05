export function slFrames(): string[] {
	const frames: string[] = [];
	for (let k = 0; k <= 34; k += 2) frames.push(' '.repeat(k) + '=^@.@^=  ~');
	return frames;
}
