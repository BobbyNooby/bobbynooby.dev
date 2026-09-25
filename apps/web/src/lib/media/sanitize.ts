import sanitizeHtml from 'sanitize-html';

const options: sanitizeHtml.IOptions = {
	allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'a'],
	allowedAttributes: { a: ['href'] },
	allowedSchemes: ['http', 'https'],
	transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }) }
};

export function sanitizeAnilistHtml(html: string): string {
	return sanitizeHtml(html ?? '', options);
}
