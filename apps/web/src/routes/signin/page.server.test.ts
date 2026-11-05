import { describe, expect, it, vi } from 'vitest';

vi.mock('../../auth', () => ({ signIn: vi.fn() }));

const { load, actions } = await import('./+page.server');

describe('/signin', () => {
	it('sends a plain GET home instead of failing', () => {
		expect(() => load({} as Parameters<typeof load>[0])).toThrow(
			expect.objectContaining({ status: 302, location: '/' })
		);
	});

	it('keeps the sign-in form action', () => {
		expect(actions.default).toBeTypeOf('function');
	});
});
