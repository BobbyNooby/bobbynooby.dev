import { describe, expect, it } from 'vitest';
import { csp } from './csp';

describe('csp', () => {
	it('allows both embed frames the page uses', () => {
		expect(csp).toContain('https://open.spotify.com');
		expect(csp).toContain('https://player.twitch.tv');
	});

	it('allows the font CDNs app.css imports stylesheets and font files from', () => {
		const directive = (name: string) => csp.split('; ').find((d) => d.startsWith(name));
		expect(directive('style-src')).toContain('https://fonts.googleapis.com');
		expect(directive('font-src')).toContain('https://fonts.gstatic.com');
		for (const section of [directive('style-src'), directive('font-src')]) {
			expect(section).toContain('https://cdn.jsdelivr.net');
			expect(section).toContain('https://fonts.cdnfonts.com');
		}
	});
});
