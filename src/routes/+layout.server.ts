import type { LayoutServerLoad } from './$types';
import { decodeSession } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const token = cookies.get('bcs_academy_token');
	let user = null;

	if (token) {
		user = decodeSession(token);
	}

	return {
		user,
		pathname: url.pathname
	};
};
