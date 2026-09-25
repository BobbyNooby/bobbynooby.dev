import { SvelteKitAuth } from '@auth/sveltekit';
import Discord from '@auth/sveltekit/providers/discord';
import { env } from '$env/dynamic/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [
		Discord({
			clientId: env.DISCORD_CLIENT_ID ?? '',
			clientSecret: env.DISCORD_CLIENT_SECRET ?? '',
			authorization: 'https://discord.com/api/oauth2/authorize?scope=identify'
		})
	],
	trustHost: true,
	callbacks: {
		async jwt({ token, profile }) {
			if (profile) {
				token.id = profile.id;
			}
			return token;
		},
		async session({ session, token }) {
			session.user.id = token.id as string;
			return session;
		}
	},
	cookies:
		env.IS_PRODUCTION == 'true'
			? {
					sessionToken: {
						name: 'sessionToken',
						options: {
							httpOnly: true,
							sameSite: 'none',
							secure: true,
							path: '/',
							domain: '.bobbynooby.dev'
						}
					}
				}
			: undefined
});
