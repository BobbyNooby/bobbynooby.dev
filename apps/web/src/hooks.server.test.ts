import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';

const { startMongoDB } = vi.hoisted(() => ({ startMongoDB: vi.fn() }));

vi.mock('$app/environment', () => ({ dev: false }));
vi.mock('$lib/db/mongo', () => ({ startMongoDB }));
vi.mock('$lib/utils/permissions', () => ({
	resolvePermissions: async () => ({ isAdmin: false, canShorten: false })
}));
vi.mock('./auth', () => ({ handle: () => {} }));
// sequence() needs SvelteKit's request store; test the site's own handler directly.
vi.mock('@sveltejs/kit/hooks', () => ({
	sequence: (...handlers: unknown[]) => handlers.at(-1)
}));

let ipCounter = 0;

function makeEvent(
	path: string,
	routeId: string | null,
	method = 'GET',
	ip = `10.0.0.${++ipCounter}`
) {
	return {
		request: new Request(`http://localhost${path}`, {
			method,
			headers: { 'x-forwarded-for': ip }
		}),
		url: new URL(`http://localhost${path}`),
		route: { id: routeId },
		getClientAddress: () => '127.0.0.1',
		setHeaders: vi.fn(),
		locals: { auth: async () => null }
	} as unknown as RequestEvent;
}

const resolve = vi.fn(async () => new Response('ok'));

async function loadHandle() {
	vi.resetModules();
	return (await import('./hooks.server')).handle;
}

async function hammer(
	handle: Awaited<ReturnType<typeof loadHandle>>,
	make: () => RequestEvent,
	times: number
) {
	const statuses: number[] = [];
	for (let i = 0; i < times; i++) {
		const res = await handle({ event: make(), resolve });
		statuses.push(res.status);
	}
	return statuses;
}

beforeEach(() => {
	startMongoDB.mockReset();
	startMongoDB.mockResolvedValue(undefined);
	resolve.mockClear();
});

describe('api rate limiter', () => {
	it('counts HEAD requests, which run the GET handler', async () => {
		const handle = await loadHandle();
		const statuses = await hammer(
			handle,
			() => makeEvent('/api/links', '/api/links', 'HEAD', 'h'),
			31
		);
		expect(statuses.slice(0, 30).every((s) => s === 200)).toBe(true);
		expect(statuses[30]).toBe(429);
	});

	it('matches the resolved route, so an encoded path is still counted', async () => {
		const handle = await loadHandle();
		const statuses = await hammer(
			handle,
			() => makeEvent('/%61pi/links', '/api/links', 'GET', 'e'),
			31
		);
		expect(statuses[30]).toBe(429);
	});

	it('leaves pages and form posts alone', async () => {
		const handle = await loadHandle();
		const pages = await hammer(handle, () => makeEvent('/customize', '/customize', 'GET', 'p'), 40);
		const posts = await hammer(
			handle,
			() => makeEvent('/api/links', '/api/links', 'POST', 'p'),
			40
		);
		expect([...pages, ...posts].every((s) => s === 200)).toBe(true);
	});
});
