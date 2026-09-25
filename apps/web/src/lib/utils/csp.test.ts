import { describe, expect, it } from 'vitest';
import { csp } from './csp';

describe('csp', () => {
	it('allows both embed frames the page uses', () => {
		expect(csp).toContain('https://open.spotify.com');
		expect(csp).toContain('https://player.twitch.tv');
	});
});
