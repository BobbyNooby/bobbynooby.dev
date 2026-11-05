import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getLongURL } = vi.hoisted(() => ({ getLongURL: vi.fn() }));
vi.mock('$lib/shortURL/shortURL', () => ({ getLongURL }));

const { load } = await import('./+page.server');

const visit = (shortURL: string) =>
	load({ params: { shortURL } } as unknown as Parameters<typeof load>[0]);

const stored = (longURL: string) => getLongURL.mockResolvedValue({ success: true, longURL });

beforeEach(() => {
	getLongURL.mockReset();
});

describe('short link load', () => {
	it('answers 404 for an unknown code', async () => {
		getLongURL.mockResolvedValue({ success: false, error: 'Short URL not found' });
		await expect(visit('nope1')).rejects.toMatchObject({ status: 404 });
	});

	it('redirects a known code from the server', async () => {
		stored('https://example.com/x?y=1');
		await expect(visit('AbCdE')).rejects.toMatchObject({
			status: 302,
			location: 'https://example.com/x?y=1'
		});
	});

	it('sends older links saved without a scheme off the site', async () => {
		stored('example.com/page');
		await expect(visit('AbCdE')).rejects.toMatchObject({
			status: 302,
			location: 'https://example.com/page'
		});
	});

	it('answers 404 rather than redirect to a stored non-web link', async () => {
		for (const longURL of ['javascript:alert(1)', 'data:text/html,hi', 'ftp://example.com/']) {
			stored(longURL);
			await expect(visit('AbCdE'), longURL).rejects.toMatchObject({ status: 404 });
		}
	});
});
