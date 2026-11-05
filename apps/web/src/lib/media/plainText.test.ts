import { describe, expect, it } from 'vitest';
import { plainText } from './plainText';

describe('plainText', () => {
	it('drops tags and turns breaks into newlines', () => {
		expect(plainText('<p>One <b>two</b><br>three<br />four</p>')).toBe('One two\nthree\nfour');
	});

	it('decodes the entities sanitize-html leaves behind', () => {
		expect(plainText('Tom &amp; Jerry &lt;3 &quot;hi&quot; it&#39;s &#x27;ok&#x27;')).toBe(
			"Tom & Jerry <3 \"hi\" it's 'ok'"
		);
	});

	it('collapses runs of blank lines and trims', () => {
		expect(plainText('  a<br><br><br><br>b  ')).toBe('a\n\nb');
	});
});
