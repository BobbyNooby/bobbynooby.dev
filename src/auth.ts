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
	cookies: {
		sessionToken: {
			name: 'sessionToken',
			options: {
				httpOnly: true,
				sameSite: IS_PRODUCTION ? 'none' : 'lax',
				secure: IS_PRODUCTION == 'true' ? true : false,
				path: '/',
				domain: IS_PRODUCTION ? '.bobbynooby.dev' : undefined
			}
		}
	}
});
