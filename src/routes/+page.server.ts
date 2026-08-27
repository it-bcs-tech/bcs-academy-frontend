import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { COURSES_CATALOG, MOCK_CERTIFICATES } from '$lib/server/mockData';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	if (!user) {
		throw redirect(303, '/login');
	}

	// Build user enrollments
	const myEnrollments = [
		{
			courseId: 'CRS-LOG-001',
			course: COURSES_CATALOG[0],
			status: 'IN_PROGRESS' as const,
			progressPercent: 80,
			completedModulesCount: 4,
			totalModulesCount: 5,
			enrolledAt: '10 Agt 2026',
			deadline: '15 Sep 2026'
		},
		{
			courseId: 'CRS-ERP-004',
			course: COURSES_CATALOG[1],
			status: 'COMPLETED' as const,
			progressPercent: 100,
			completedModulesCount: 3,
			totalModulesCount: 3,
			enrolledAt: '01 Agt 2026',
			completedAt: '22 Agt 2026',
			score: 95,
			hasCertificate: true,
			certificateNumber: 'CERT-BCS-2026-0889'
		},
		{
			courseId: 'CRS-K3-002',
			course: COURSES_CATALOG[2],
			status: 'IN_PROGRESS' as const,
			progressPercent: 25,
			completedModulesCount: 1,
			totalModulesCount: 4,
			enrolledAt: '15 Agt 2026',
			deadline: '30 Sep 2026'
		}
	];

	return {
		enrollments: myEnrollments,
		catalog: COURSES_CATALOG,
		certificates: MOCK_CERTIFICATES
	};
};
