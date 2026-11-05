import { describe, expect, it } from 'vitest';
import { textOf } from '../testing';
import type { BshProject } from '../types';
import { nmap } from './nmap';

const project = (title: string, href: string): BshProject => ({ title, description: '', href });
const repo = 'https://github.com/BobbyNooby/agamoto';

describe('nmap', () => {
	it('prints the fake report for the site', () => {
		expect(textOf(nmap('', [])).split('\n')).toEqual([
			'agamoto-lite 0.0.1 · a joke, not a scan',
			'report for bobbynooby.dev',
			'PORT       STATE   SERVICE',
			'80/tcp     open    http    → sends you to 443',
			'443/tcp    open    https   → you are here',
			'1337/tcp   honk    goose',
			'CVE context: none. it is a personal website.',
			'LLM recommendation: say hi in /Chat instead.'
		]);
	});

	it('reports on the target you give it', () => {
		expect(nmap('example.com', [])[1]).toEqual([{ t: 'report for example.com' }]);
	});

	it('ends with a link to the agamoto project', () => {
		const lines = nmap('', [project('other', 'https://x.dev'), project('Agamoto', repo)]);
		expect(lines.at(-1)).toEqual([{ t: 'the real tool: ' }, { t: repo, href: repo }]);
	});

	it('never links an unsafe href', () => {
		const link = nmap('', [project('agamoto', 'javascript:alert(1)')]).at(-1)!;
		expect(link[1].t).toBe('javascript:alert(1)');
		expect(link[1].href).toBeUndefined();
	});
});
