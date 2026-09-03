// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			/** Resolved once per request in hooks.server.ts from the admin_ids collection. */
			isAdmin: boolean;
			/** Looser than admin: allowed to use the URL shortener. */
			canShorten: boolean;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
