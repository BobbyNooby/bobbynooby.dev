import { describe, expect, it } from 'vitest';
import { corsHeaders } from './corsHeaders';

describe('corsHeaders', () => {
	it('allows the site origins', () => {
		expect(corsHeaders('https://bobbynooby.dev')['Access-Control-Allow-Origin']).toBe(
			'https://bobbynooby.dev'
		);
		expect(corsHeaders('https://www.bobbynooby.dev')['Access-Control-Allow-Origin']).toBe(
			'https://www.bobbynooby.dev'
		);
	});
	it('withholds ACAO from foreign origins', () => {
		expect(corsHeaders('https://evil.example')['Access-Control-Allow-Origin']).toBeUndefined();
		expect(corsHeaders(null)['Access-Control-Allow-Origin']).toBeUndefined();
	});
});
