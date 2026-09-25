import { pickForwardedIp } from '@bobbynooby/shared';

export function pickClientIp(headers: Headers, fallback: string): string {
	return pickForwardedIp(headers.get('x-forwarded-for'), fallback);
}
