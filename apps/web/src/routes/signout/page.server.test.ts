import { describe, expect, it, vi } from 'vitest';

vi.mock('../../auth', () => ({ signOut: vi.fn() }));

const { load, actions } = await import('./+page.server');

describe('/signout', () => {
	it('sends a plain GET home instead of failing', () => {
		expect(() => load({} as Parameters<typeof load>[0])).toThrow(
			expect.objectContaining({ status: 302, location: '/' })
		);
	});

	it('keeps the sign-out form action', () => {
		expect(actions.default).toBeTypeOf('function');
	});
});
