import { describe, expect, it } from 'vitest';
import { ACH, createAchievementStore } from './achievements';
import { memoryStorage } from './testing';

describe('ACH', () => {
	it('has 20 unique keys, 10 hidden', () => {
		expect(ACH).toHaveLength(20);
		expect(new Set(ACH.map((a) => a.key)).size).toBe(20);
		expect(ACH.filter((a) => a.hidden)).toHaveLength(10);
	});
});

describe('createAchievementStore', () => {
	it('unlocks once and persists', () => {
		const mem = memoryStorage();
		const s = createAchievementStore(mem);
		expect(s.unlock('honk')).toBe(true);
		expect(s.unlock('honk')).toBe(false);
		expect(JSON.parse(mem.getItem('bsh:ach')!)).toEqual(['honk']);
		expect(createAchievementStore(mem).has('honk')).toBe(true);
	});

	it('derives trust from honks', () => {
		const s = createAchievementStore(memoryStorage({ 'bsh:honks': '9' }));
		expect(s.trusted()).toBe(false);
		expect(s.addHonk()).toBe(10);
		expect(s.trusted()).toBe(true);
	});

	it('survives throwing, corrupt and foreign storage', () => {
		const throwing = {
			getItem: () => {
				throw new Error('denied');
			},
			setItem: () => {
				throw new Error('denied');
			}
		};
		expect(() => createAchievementStore(throwing).unlock('honk')).not.toThrow();
		expect(createAchievementStore(memoryStorage({ 'bsh:ach': '{nope' })).count()).toBe(0);
		const s = createAchievementStore(
			memoryStorage({ 'bsh:ach': '["honk","made_up"]', 'bsh:honks': 'abc' })
		);
		expect(s.count()).toBe(1);
		expect(s.honks()).toBe(0);
		expect(createAchievementStore(null).unlock('visit')).toBe(true);
	});
});
