import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import sql from '$lib/server/db';
import type { Course } from '$lib/types/academy';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	if (!user) {
		throw redirect(303, '/login');
	}

	try {
		const userPayrollId = (user.payrollId || '').toUpperCase().trim();

		// Hanya ambil kursus resmi yang ditautkan ke akun karyawan ini (hris.lms_enrollments)
		const rows = await sql`
			SELECT 
				c.*,
				e.status as enrollment_status,
				e.progress_percent,
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
			JOIN hris.lms_enrollments e ON e.course_id = c.id
			LEFT JOIN hris.lms_modules m ON m.course_id = c.id
			WHERE c.status = 'Published'
			  AND UPPER(TRIM(e.payroll_id)) = ${userPayrollId}
			GROUP BY c.id, e.status, e.progress_percent
			ORDER BY c.created_at DESC;
		`;

		const dbCatalog: Course[] = (rows || []).map((r: any) => ({
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

		return {
			user,
			catalog: dbCatalog
		};
	} catch (err) {
		console.error('Failed to load courses from DB:', err);
		return {
			user,
			catalog: []
		};
	}
};
