import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createShortURL } = vi.hoisted(() => ({ createShortURL: vi.fn() }));
vi.mock('$lib/shortURL/shortURL', () => ({ createShortURL }));

const { actions } = await import('./+page.server');

function submit(longURL: string, canShorten = true) {
	const body = new FormData();
	body.set('longURL', longURL);
	const request = new Request('http://localhost/shorten?/create', { method: 'POST', body });
	return actions.create({ request, locals: { canShorten } } as unknown as Parameters<
		typeof actions.create
	>[0]);
}

beforeEach(() => {
	createShortURL.mockReset();
	createShortURL.mockResolvedValue({ success: true, shortURL: 'AbCdE' });
});

describe('shorten create action', () => {
	it('stores the link with a scheme so the redirect leaves the site', async () => {
		await expect(submit('example.com/page')).resolves.toEqual({
			success: true,
			shortURL: 'AbCdE'
		});
		expect(createShortURL).toHaveBeenCalledWith('https://example.com/page');
	});

	it('rejects links that are not http or https without touching the db', async () => {
		await expect(submit('javascript:alert(1)')).resolves.toMatchObject({ status: 400 });
		expect(createShortURL).not.toHaveBeenCalled();
	});

	it('is closed to visitors without the shortener permission', async () => {
		await expect(submit('example.com', false)).resolves.toMatchObject({ status: 403 });
		expect(createShortURL).not.toHaveBeenCalled();
	});
});
