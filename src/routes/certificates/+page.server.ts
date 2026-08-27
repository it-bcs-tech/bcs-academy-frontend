import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { MOCK_CERTIFICATES } from '$lib/server/mockData';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	if (!user) {
		throw redirect(303, '/login');
	}

	return {
		certificates: MOCK_CERTIFICATES
	};
};
