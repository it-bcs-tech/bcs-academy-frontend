// @ts-nocheck
import type { LayoutServerLoad } from './$types';
import { decodeSession } from '$lib/server/auth';

export const load = async ({ cookies, url }: Parameters<LayoutServerLoad>[0]) => {
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
