import { describe, expect, it } from 'vitest';
import { sanitizeAnilistHtml } from './sanitize';

describe('sanitizeAnilistHtml', () => {
	it('keeps allowed tags and text', () => {
		expect(sanitizeAnilistHtml('<b>Bold</b> <i>ital</i><br/>plain')).toBe(
			'<b>Bold</b> <i>ital</i><br />plain'
		);
	});
	it('strips scripts and event handlers', () => {
		const out = sanitizeAnilistHtml('<script>alert(1)</script>ok<img src=x onerror=alert(1)>');
		expect(out).not.toContain('script');
		expect(out).not.toContain('onerror');
		expect(out).toContain('ok');
	});
	it('keeps only http(s) or relative hrefs', () => {
		expect(sanitizeAnilistHtml('<a href="https://anilist.co">x</a>')).toContain('href');
		expect(sanitizeAnilistHtml('<a href="javascript:alert(1)">x</a>')).not.toContain('href');
	});
});
