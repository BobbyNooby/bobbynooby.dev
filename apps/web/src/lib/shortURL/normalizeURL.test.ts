import { describe, expect, it } from 'vitest';
import { normalizeURL } from './normalizeURL';

describe('normalizeURL', () => {
	it('adds https:// when there is no scheme, so the redirect leaves the site', () => {
		expect(normalizeURL('example.com')).toBe('https://example.com/');
		expect(normalizeURL('www.example.com/path?q=1')).toBe('https://www.example.com/path?q=1');
		expect(normalizeURL('example.com:8080/x')).toBe('https://example.com:8080/x');
		expect(normalizeURL('  example.com  ')).toBe('https://example.com/');
	});

	it('keeps http and https links, whatever the scheme case', () => {
		expect(normalizeURL('https://example.com/path?q=1')).toBe('https://example.com/path?q=1');
		expect(normalizeURL('http://example.com')).toBe('http://example.com/');
		expect(normalizeURL('HTTPS://Example.com/A')).toBe('https://example.com/A');
	});

	it('accepts percent-encoding, international domains and IP addresses', () => {
		expect(normalizeURL('https://example.com/a%20b?q=%C3%A9')).toBe(
			'https://example.com/a%20b?q=%C3%A9'
		);
		expect(normalizeURL('https://bücher.de/')).toBe('https://xn--bcher-kva.de/');
		expect(normalizeURL('192.168.0.1/admin')).toBe('https://192.168.0.1/admin');
		expect(normalizeURL('http://[2001:db8::1]:8080/')).toBe('http://[2001:db8::1]:8080/');
	});

	it('rejects other schemes', () => {
		for (const url of [
			'javascript:alert(1)',
			'JavaScript://%0aalert(1)',
			'data:text/html,hi',
			'file:///etc/passwd',
			'ftp://example.com/',
			'vbscript:msgbox(1)'
		]) {
			expect(normalizeURL(url), url).toBeNull();
		}
	});

	it('rejects input that is not a link to a host', () => {
		for (const url of ['not a url', 'hello', 'https://', 'http://', '', 'ab']) {
			expect(normalizeURL(url), url).toBeNull();
		}
	});

	it('rejects overlong input quickly', () => {
		const long = `https://example.com/${'a'.repeat(2048)}`;
		const start = performance.now();
		expect(normalizeURL(long)).toBeNull();
		expect(normalizeURL('a'.repeat(48_000))).toBeNull();
		expect(performance.now() - start).toBeLessThan(50);
	});
});
