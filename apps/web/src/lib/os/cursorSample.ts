import type { PaneKey } from '@bobbynooby/shared';

export type CursorSample = { t: number; pane: PaneKey; x: number; y: number };
export type Point = { x: number; y: number };

// The server batches every ~100ms; cursors are drawn 150ms in the past so
// there is usually a sample on each side of the moment being drawn.
export const NET_MS = 100;
export const DELAY_MS = 150;

// Where a cursor should be at render time `t` (already shifted into the past).
// Holds at the newest sample when nothing newer exists, and after a long rest
// slides across only the last 1.5 batches instead of crawling over the gap.
export function sample(
	buffer: CursorSample[],
	t: number,
	toPx: (s: CursorSample) => Point | null
): Point | null {
	if (!buffer.length) return null;
	let i = buffer.length - 1;
	while (i > 0 && buffer[i].t > t) i--;
	const a = buffer[i];
	const b = buffer[i + 1];
	const pa = toPx(a);
	const pb = b ? toPx(b) : null;
	if (!pa || !pb) return pa ?? pb;
	const start = Math.max(a.t, b.t - NET_MS * 1.5);
	const k = Math.min(1, Math.max(0, (t - start) / (b.t - start || 1)));
	return { x: pa.x + (pb.x - pa.x) * k, y: pa.y + (pb.y - pa.y) * k };
}
