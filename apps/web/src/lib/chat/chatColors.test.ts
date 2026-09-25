import { describe, expect, it } from 'vitest';
import { chatColorForRank, chatRankColors } from './chatColors';

describe('chatRankColors', () => {
	it('renders system messages yellow', () => {
		expect(chatColorForRank('system')).toBe('#FDE047');
	});

	it('keeps the owner green and guests gray', () => {
		expect(chatRankColors.owner).toBe('#00FF00');
		expect(chatColorForRank('guest')).toBe('#CECECE');
	});

	it('falls back to gray for unknown ranks', () => {
		expect(chatColorForRank('somethingnew')).toBe('#CECECE');
	});
});
