import type { Session } from '@auth/sveltekit';

export async function getCommandTreeServer(
	session: Session | null | undefined
): Promise<Record<string, { args: number }>> {
	const { data, error } = await fetch('http://localhost:5173/api/command_tree_server', {
		method: 'POST',
		body: JSON.stringify({ session: session })
	}).then((res) => res.json());
	if (error) {
		return {};
	}

	return data;
}
