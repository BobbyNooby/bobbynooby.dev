import { SvelteKitAuth } from '@auth/sveltekit';
import Discord from '@auth/sveltekit/providers/discord';
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, IS_PRODUCTION } from '$env/static/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [
		Discord({
			clientId: DISCORD_CLIENT_ID,
			clientSecret: DISCORD_CLIENT_SECRET,
			authorization: 'https://discord.com/api/oauth2/authorize?scope=identify'
		})
	],
	trustHost: true,
	callbacks: {
		async jwt({ token, account, profile }) {
			if (profile) {
				token.id = profile.id;
			}
			return token;
		},
		async session({ session, token, user }) {
			session.user.id = token.id as string;
			return session;
		}
	},
	cookies:
		IS_PRODUCTION == 'true'
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
