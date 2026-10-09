import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import sql from '$lib/server/db';
import { MOCK_CERTIFICATES } from '$lib/server/mockData';
import type { Certificate } from '$lib/types/academy';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	if (!user) {
		throw redirect(303, '/login');
	}

	try {
		const certRows = await sql`
			SELECT * FROM hris.lms_certificates
			WHERE UPPER(payroll_id) = ${user.payrollId.toUpperCase()}
			ORDER BY issued_at DESC;
		`;

		if (certRows && certRows.length > 0) {
			const certificates: Certificate[] = certRows.map((c: any) => ({
				certificateNumber: c.certificate_number,
				payrollId: c.payroll_id,
				employeeName: c.employee_name,
				courseId: c.course_id,
				courseTitle: c.course_title,
				category: c.category,
				score: Number(c.score),
				issuedAt: c.issued_at ? c.issued_at.toISOString().split('T')[0] : '',
				validUntil: c.valid_until ? c.valid_until.toISOString().split('T')[0] : '',
				qrVerifyUrl: c.qr_verify_url
			}));

			return {
				certificates
			};
		}
	} catch (e) {
		console.error('Error fetching certificates from DB:', e);
	}

	return {
		certificates: MOCK_CERTIFICATES
	};
};
