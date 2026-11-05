import { describe, expect, it, vi } from 'vitest';
import { fixture, textOf } from '$lib/bsh/testing';
import type { OsContext } from './os.svelte';

vi.mock('$lib/utils/playAudio', () => ({ playAudio: vi.fn() }));
vi.mock('$lib/twitch/twitchLive.svelte', () => ({ twitch: { status: null } }));

const { OsState } = await import('./os.svelte');
const { ShellView } = await import('./shell.svelte');

const key = (k: string) => ({ key: k, preventDefault: () => {} }) as unknown as KeyboardEvent;

function setup() {
	const chat = { send: vi.fn(), rename: vi.fn() };
	const ctx = {
		os: new OsState(),
		live: { discord: 'idle', song: { isPlaying: false } },
		chat,
		presence: {}
	} as unknown as OsContext;
	const openWindow = vi.fn();
	const view = new ShellView(ctx, { openWindow });
	view.start(fixture, 'Guest_1234');
	const text = () => textOf(view.lines.map((l) => l.segs));
	return { view, ctx, chat, openWindow, text };
}

describe('ShellView', () => {
	it('greets, marks the first visit and plays the sample session', () => {
		const { view, text } = setup();
		expect(view.ready).toBe(true);
		expect(text()).toContain('welcome, guest_1234.');
		expect(text()).toContain('+ achievement: First Visit');
		expect(text()).toContain('guest_1234@bobbynooby.dev:~$ ls projects');
		expect(view.prompt).toBe('guest_1234@bobbynooby.dev:~$');
	});

	it('keeps the prompt and the pane focus in step with cd', () => {
		const { view, ctx } = setup();
		view.run('cd games');
		expect(view.prompt).toBe('guest_1234@bobbynooby.dev:~/games$');
		expect(view.title).toBe('~/games');
		expect(ctx.os.focused).toBe('games');
		view.run('cd ~/3x3/manga');
		expect(ctx.os.gridCat).toBe('manga');
	});

	it('sends say and username through the chat store', () => {
		const { view, chat } = setup();
		view.run('say hello there');
		expect(chat.send).toHaveBeenCalledWith('Guest_1234', 'hello there');
		view.run('username bob');
		expect(chat.rename).toHaveBeenCalledWith('bob');
		expect(view.prompt).toBe('bob@bobbynooby.dev:~$');
	});

	it('opens windows through the page hook', () => {
		const { view, openWindow } = setup();
		view.run('cat games/elden-ring.txt');
		expect(openWindow).toHaveBeenCalledWith(
			expect.objectContaining({
				kind: 'game',
				game: expect.objectContaining({ name: 'ELDEN RING' })
			})
		);
	});

	it('reads live status when a status file is read', () => {
		const { view, text } = setup();
		view.run('cat status/discord.txt');
		expect(text()).toContain('idle');
	});

	it('keeps at most 200 lines', () => {
		const { view } = setup();
		for (let i = 0; i < 150; i++) view.run('pwd');
		expect(view.lines.length).toBe(200);
	});

	it('runs snake in the output: board, pad, quit', () => {
		const { view, text } = setup();
		view.run('snake');
		expect(view.snaking).toBe(true);
		expect(view.lines.some((l) => l.kind === 'snake')).toBe(true);
		expect(view.lines.some((l) => l.kind === 'pad')).toBe(true);
		expect(text()).toContain('press a direction to start');
		expect(view.snakeKey(key('q'))).toBe(true);
		expect(view.snaking).toBe(false);
		expect(view.lines.some((l) => l.kind === 'pad')).toBe(false);
		expect(text()).toContain('quit. score 0   (10 unlocks something)');
	});

	it('ends snake with game over when it hits a wall', () => {
		vi.useFakeTimers();
		try {
			const { view, text } = setup();
			view.run('snake');
			view.snakeTurn([0, -1]);
			vi.advanceTimersByTime(140 * 40);
			expect(view.snaking).toBe(false);
			expect(text()).toMatch(/game over\. score \d+/);
		} finally {
			vi.useRealTimers();
		}
	});

	it('leaves keys alone when no game is running', () => {
		const { view } = setup();
		expect(view.snakeKey(key('ArrowUp'))).toBe(false);
	});
});
