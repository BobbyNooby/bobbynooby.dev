export function wrapEmojis(text: string) {
	const emojiRegex =
		/([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{1FB00}-\u{1FBFF}]|[\u{1FC00}-\u{1FCFF}]|[\u{1FD00}-\u{1FDFF}]|[\u{1FE00}-\u{1FEFF}]|[\u{1FF00}-\u{1FFFF}]|[\u{2700}-\u{27BF}]|[\u{2600}-\u{26FF}]|[\u{2300}-\u{23FF}]|[\u{2000}-\u{20FF}]|[\u{2100}-\u{214F}]|[\u{2190}-\u{21FF}]|[\u{25A0}-\u{25FF}])/gu;

	return text.replace(emojiRegex, '<span class="emoji-font">$1</span>');
}
