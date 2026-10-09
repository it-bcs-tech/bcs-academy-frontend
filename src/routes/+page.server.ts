import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import sql from '$lib/server/db';
import { COURSES_CATALOG, MOCK_CERTIFICATES } from '$lib/server/mockData';
import type { Course, Certificate } from '$lib/types/academy';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	if (!user) {
		throw redirect(303, '/login');
	}

	let catalog: Course[] = COURSES_CATALOG;
	let userCerts: Certificate[] = MOCK_CERTIFICATES;

	try {
		// 1. Ambil catalog aktif dari DB
		const courseRows = await sql`
			SELECT 
				c.*,
				COALESCE(
					json_agg(
						json_build_object(
							'id', m.id,
							'sequence', m.sequence,
							'title', m.title,
							'type', m.type,
							'durationText', m.duration_text,
							'contentUrl', m.content_url,
							'contentBody', m.content_body
						) ORDER BY m.sequence ASC
					) FILTER (WHERE m.id IS NOT NULL), '[]'::json
				) as modules
			FROM hris.lms_courses c
			LEFT JOIN hris.lms_modules m ON m.course_id = c.id
			WHERE c.status = 'Published'
			GROUP BY c.id
			ORDER BY c.created_at DESC;
		`;

		if (courseRows && courseRows.length > 0) {
			catalog = courseRows.map((r: any) => ({
				id: r.id,
				title: r.title,
				category: r.category,
				level: r.level,
				durationHours: Number(r.duration_hours),
				modulesCount: r.modules_count || (r.modules ? r.modules.length : 0),
				enrolledCount: r.enrolled_count || 0,
				completionRate: Number(r.completion_rate) || 0,
				rating: Number(r.rating) || 5.0,
				instructor: r.instructor || 'Internal Trainer BCS',
				description: r.description || '',
				tags: r.tags || [],
				thumbnailUrl: r.thumbnail_url,
				modules: r.modules || []
			}));
		}

		// 2. Ambil sertifikat resmi milik user
		const certRows = await sql`
			SELECT * FROM hris.lms_certificates
			WHERE UPPER(payroll_id) = ${user.payrollId.toUpperCase()}
			ORDER BY issued_at DESC;
		`;

		if (certRows && certRows.length > 0) {
			userCerts = certRows.map((c: any) => ({
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
		}

		// 3. Ambil penugasan kursus / enrollments resmi milik user dari PostgreSQL
		const enrollRows = await sql`
			SELECT e.*, c.title as course_title, c.category as course_category, c.level as course_level,
			       c.duration_hours, c.modules_count, c.instructor, c.description, c.thumbnail_url
			FROM hris.lms_enrollments e
			JOIN hris.lms_courses c ON c.id = e.course_id
			WHERE UPPER(e.payroll_id) = ${user.payrollId.toUpperCase()}
			ORDER BY e.is_tna_gap DESC, e.enrolled_at DESC;
		`;

		if (enrollRows && enrollRows.length > 0) {
			const dbEnrollments = enrollRows.map((r: any) => {
				const foundCourse = catalog.find((c) => c.id === r.course_id) || {
					id: r.course_id,
					title: r.course_title,
					category: r.course_category,
					level: r.course_level || 'Mandatory',
					durationHours: Number(r.duration_hours || 2),
					modulesCount: r.modules_count || 3,
					enrolledCount: 1,
					rating: 5.0,
					instructor: r.instructor || 'Internal Trainer BCS',
					description: r.description || '',
					tags: ['LMS', 'GAP Competency'],
					modules: []
				};

				return {
					courseId: r.course_id,
					course: foundCourse,
					status: (r.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS') as 'COMPLETED' | 'IN_PROGRESS',
					progressPercent: Number(r.progress_percent || 0),
					completedModulesCount: Number(r.completed_modules_count || 0),
					totalModulesCount: Number(r.total_modules_count || foundCourse.modulesCount || 3),
					enrolledAt: r.enrolled_at ? r.enrolled_at.toISOString().split('T')[0] : '01 Agt 2026',
					completedAt: r.completed_at ? r.completed_at.toISOString().split('T')[0] : undefined,
					deadline: r.deadline ? r.deadline.toISOString().split('T')[0] : '30 Hari ke depan',
					score: r.post_test_score ? Number(r.post_test_score) : undefined,
					hasCertificate: Boolean(r.has_certificate),
					certificateNumber: r.certificate_number,
					isTnaGap: Boolean(r.is_tna_gap),
					competencyCode: r.competency_code
				};
			});

			return {
				enrollments: dbEnrollments,
				catalog,
				certificates: userCerts
			};
		}
	} catch (e) {
		console.error('Error loading live DB data for employee dashboard:', e);
	}

	// Fallback user enrollments
	const myEnrollments = catalog.slice(0, 3).map((c, idx) => ({
		courseId: c.id,
		course: c,
		status: (idx === 1 ? 'COMPLETED' : 'IN_PROGRESS') as 'COMPLETED' | 'IN_PROGRESS',
		progressPercent: idx === 1 ? 100 : idx === 0 ? 80 : 25,
		completedModulesCount: idx === 1 ? c.modulesCount : idx === 0 ? Math.max(1, c.modulesCount - 1) : 1,
		totalModulesCount: c.modulesCount,
		enrolledAt: '01 Agt 2026',
		completedAt: idx === 1 ? '22 Agt 2026' : undefined,
		deadline: idx === 1 ? undefined : '30 Sep 2026',
		score: idx === 1 ? 95 : undefined,
		hasCertificate: idx === 1,
		certificateNumber: idx === 1 ? userCerts[0]?.certificateNumber || 'CERT-BCS-2026-0889' : undefined,
		isTnaGap: idx === 0,
		competencyCode: idx === 0 ? 'E06' : undefined
	}));

	return {
		enrollments: myEnrollments,
		catalog,
		certificates: userCerts
	};
};
