import { z } from 'zod';

export const PANE_KEYS = [
	'about',
	'projects',
	'games',
	'chat',
	'links',
	'status',
	'music',
	'grid',
	'twitch'
] as const;

export type PaneKey = (typeof PANE_KEYS)[number];

export const PRESENCE_NAME_MAX_LENGTH = 24;

export const presenceHelloSchema = z.object({
	t: z.literal('hello'),
	id: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
	name: z.string().trim().min(1).max(PRESENCE_NAME_MAX_LENGTH)
});

// Any finite number is accepted; the registry clamps to 0-1.
export const presenceCurSchema = z.object({
	t: z.literal('cur'),
	pane: z.enum(PANE_KEYS),
	x: z.number(),
	y: z.number()
});

export const presenceHideSchema = z.object({ t: z.literal('hide') });

export const presenceClientMessageSchema = z.discriminatedUnion('t', [
	presenceHelloSchema,
	presenceCurSchema,
	presenceHideSchema
]);

export type PresenceHello = z.infer<typeof presenceHelloSchema>;
export type PresenceCur = z.infer<typeof presenceCurSchema>;
export type PresenceHide = z.infer<typeof presenceHideSchema>;
export type PresenceClientMessage = z.infer<typeof presenceClientMessageSchema>;

export type PresenceCursor = { id: string; name: string; pane: PaneKey; x: number; y: number };

export type PresenceState = { t: 'state'; here: number; cursors: PresenceCursor[] };
