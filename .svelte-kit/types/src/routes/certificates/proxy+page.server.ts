// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { MOCK_CERTIFICATES } from '$lib/server/mockData';

export const load = async ({ parent }: Parameters<PageServerLoad>[0]) => {
	const { user } = await parent();
	if (!user) {
		throw redirect(303, '/login');
	}

	return {
		certificates: MOCK_CERTIFICATES
	};
};
