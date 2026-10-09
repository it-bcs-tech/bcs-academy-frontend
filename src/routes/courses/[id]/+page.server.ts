import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import sql from '$lib/server/db';
import { COURSES_CATALOG } from '$lib/server/mockData';
import { decodeSession } from '$lib/server/auth';
import type { Course, QuizQuestion, EmployeeUser } from '$lib/types/academy';

function getSessionUser(cookies: any): EmployeeUser {
	try {
		const token = cookies.get('bcs_academy_token');
		if (token) {
			const decoded = decodeSession(token);
			if (decoded) return decoded;
		}
	} catch (e) {
		console.error('Error decoding session token:', e);
	}

	// Fallback ke session demo terdaftar jika cookie belum ada
	return {
		id: 42,
		payrollId: 'EMP-0042',
		name: 'GUNTORO MUHAMAD',
		division: 'OPERATION',
		divisionCode: 'DV_41',
		title: 'PENGEMUDI TRUK TRONTON',
		levelSequence: 1
	};
}

export const load: PageServerLoad = async ({ params, parent, cookies }) => {
	let user = getSessionUser(cookies);
	try {
		const parentData = await parent();
		if (parentData?.user) {
			user = parentData.user;
		}
	} catch (e) {
		// fallback to getSessionUser
	}

	let course: Course | undefined;

	try {
		// 1. Ambil data kursus dan modul dari database
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
			WHERE c.id = ${params.id}
			GROUP BY c.id
			LIMIT 1;
		`;

		if (courseRows && courseRows.length > 0) {
			const r = courseRows[0];
			course = {
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
			};
		}
	} catch (e) {
		console.error('Error loading course from DB:', e);
	}

	if (!course) {
		course = COURSES_CATALOG.find((c) => c.id === params.id) || COURSES_CATALOG[0];
	}

	if (!course) {
		throw error(404, 'Kursus tidak ditemukan');
	}

	// 2. Ambil Soal-soal Kuis Pre-Test & Post-Test dari Database
	let preTestQuestions: QuizQuestion[] = [];
	let postTestQuestions: QuizQuestion[] = [];

	try {
		const qRows = await sql`
			SELECT id, course_id, quiz_type, question_text, options, correct_key, explanation
			FROM hris.lms_quiz_questions
			WHERE course_id = ${params.id}
			ORDER BY quiz_type ASC, id ASC;
		`;

		for (const q of qRows) {
			const parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
			const item: QuizQuestion = {
				id: q.id,
				courseId: q.course_id,
				quizType: q.quiz_type,
				questionText: q.question_text,
				options: parsedOptions || [],
				correctKey: q.correct_key,
				explanation: q.explanation
			};

			if (q.quiz_type === 'PRE_TEST') {
				preTestQuestions.push(item);
			} else {
				postTestQuestions.push(item);
			}
		}
	} catch (err) {
		console.error('Error loading quiz questions:', err);
	}

	// Fallback jika belum ada soal di DB untuk kursus ini
	if (preTestQuestions.length === 0) {
		preTestQuestions = [
			{
				id: 901,
				courseId: course.id,
				quizType: 'PRE_TEST',
				questionText: `Sejauh mana pemahaman awal Anda mengenai materi [${course.title}] sebelum mengikuti sesi ini?`,
				options: [
					{ key: 'A', text: 'Sangat Paham (Sudah sering menerapkan SOP terkait)' },
					{ key: 'B', text: 'Cukup Paham (Mengetahui dasar teori namun perlu pendalaman)' },
					{ key: 'C', text: 'Belum Paham (Materi baru bagi saya)' }
				],
				correctKey: 'A'
			},
			{
				id: 902,
				courseId: course.id,
				quizType: 'PRE_TEST',
				questionText: 'Apa tujuan utama penerapan standar keselamatan kerja dan prosedur operasional PT BCS Logistics?',
				options: [
					{ key: 'A', text: 'Mencegah insiden, kecelakaan nihil (Zero Accident), dan menjaga kehandalan armada logistik' },
					{ key: 'B', text: 'Hanya untuk memenuhi formalitas dokumen audit' },
					{ key: 'C', text: 'Mempercepat pengiriman tanpa mempedulikan kondisi armada' }
				],
				correctKey: 'A'
			}
		];
	}

	if (postTestQuestions.length === 0) {
		postTestQuestions = [
			{
				id: 911,
				courseId: course.id,
				quizType: 'POST_TEST',
				questionText: `Apa prinsip mendasar yang wajib dipatuhi dalam pelaksanaan program [${course.title}]?`,
				options: [
					{ key: 'A', text: 'Kepatuhan penuh pada Standard Working Procedure (SWP) dan keselamatan kerja' },
					{ key: 'B', text: 'Mengabaikan prosedur jika situasi mendesak di lapangan' },
					{ key: 'C', text: 'Menyerahkan seluruh tanggung jawab keselamatan kepada rekan kerja' }
				],
				correctKey: 'A'
			},
			{
				id: 912,
				courseId: course.id,
				quizType: 'POST_TEST',
				questionText: 'Bagaimana tindakan Anda jika menemukan deviasi atau potensi bahaya selama operasional berlangsung?',
				options: [
					{ key: 'A', text: 'Segera menghentikan aktivitas (Stop Work Authority) dan melapor ke Supervisor/QHSE' },
					{ key: 'B', text: 'Melanjutkan pekerjaan dan membiarkannya sampai terjadi insiden' },
					{ key: 'C', text: 'Mendiamkannya karena bukan tugas langsung saya' }
				],
				correctKey: 'A'
			},
			{
				id: 913,
				courseId: course.id,
				quizType: 'POST_TEST',
				questionText: 'Apa dampak positif dari pencapaian standar kompetensi kerja bagi keberlangsungan bisnis PT BCS?',
				options: [
					{ key: 'A', text: 'Meningkatkan kepuasan pelanggan, efisiensi operasional, dan kepatuhan regulasi K3' },
					{ key: 'B', text: 'Tidak ada dampak yang terukur bagi perusahaan' },
					{ key: 'C', text: 'Menambah birokrasi tanpa hasil konkret' }
				],
				correctKey: 'A'
			}
		];
	}

	// 3. Ambil Rekam Jejak Enrollment Karyawan
	let enrollment: any = null;
	let certificate: any = null;
	let initialStep: 1 | 2 | 3 | 4 | 5 = 1;

	try {
		const enrollRows = await sql`
			SELECT * FROM hris.lms_enrollments
			WHERE course_id = ${params.id} AND UPPER(payroll_id) = ${user.payrollId.toUpperCase()}
			LIMIT 1;
		`;

		if (enrollRows && enrollRows.length > 0) {
			enrollment = {
				id: enrollRows[0].id,
				courseId: enrollRows[0].course_id,
				payrollId: enrollRows[0].payroll_id,
				employeeName: enrollRows[0].employee_name,
				status: enrollRows[0].status,
				progressPercent: Number(enrollRows[0].progress_percent || 0),
				completedModulesCount: Number(enrollRows[0].completed_modules_count || 0),
				totalModulesCount: Number(enrollRows[0].total_modules_count || course.modules.length),
				preTestScore: enrollRows[0].pre_test_score !== null ? Number(enrollRows[0].pre_test_score) : null,
				postTestScore: enrollRows[0].post_test_score !== null ? Number(enrollRows[0].post_test_score) : null,
				enrolledAt: enrollRows[0].enrolled_at ? enrollRows[0].enrolled_at.toISOString() : '',
				completedAt: enrollRows[0].completed_at ? enrollRows[0].completed_at.toISOString() : '',
				hasCertificate: Boolean(enrollRows[0].has_certificate),
				certificateNumber: enrollRows[0].certificate_number
			};
		}

		// Ambil sertifikat jika ada
		const certRows = await sql`
			SELECT * FROM hris.lms_certificates
			WHERE course_id = ${params.id} AND UPPER(payroll_id) = ${user.payrollId.toUpperCase()}
			LIMIT 1;
		`;

		if (certRows && certRows.length > 0) {
			certificate = {
				certificateNumber: certRows[0].certificate_number,
				payrollId: certRows[0].payroll_id,
				employeeName: certRows[0].employee_name,
				courseId: certRows[0].course_id,
				courseTitle: certRows[0].course_title,
				category: certRows[0].category,
				score: Number(certRows[0].score),
				issuedAt: certRows[0].issued_at ? certRows[0].issued_at.toISOString().split('T')[0] : '',
				validUntil: certRows[0].valid_until ? certRows[0].valid_until.toISOString().split('T')[0] : '',
				qrVerifyUrl: certRows[0].qr_verify_url
			};
		}
	} catch (err) {
		console.error('Error loading enrollment/certificate:', err);
	}

	// 4. Tentukan Step Awal secara Cerdas Berdasarkan Progres Riil
	if (certificate || enrollment?.status === 'COMPLETED') {
		initialStep = 5;
	} else if (enrollment?.postTestScore !== null && enrollment?.postTestScore >= 75) {
		initialStep = 4;
	} else if (enrollment?.preTestScore !== null && enrollment?.completedModulesCount >= course.modules.length) {
		initialStep = 3;
	} else if (enrollment?.preTestScore !== null) {
		initialStep = 2;
	} else {
		initialStep = 1;
	}

	return {
		course,
		enrollment,
		preTestQuestions,
		postTestQuestions,
		certificate,
		initialStep
	};
};

export const actions = {
	// ══════════════════════════════════════════════════════════════
	// STEP 1: SUBMIT PRE-TEST (UJI BASELINE PEMAHAMAN AWAL)
	// ══════════════════════════════════════════════════════════════
	submitPreTest: async ({ request, params, cookies }) => {
		const user = getSessionUser(cookies);

		const formData = await request.formData();
		const courseId = params.id;
		const payrollId = user.payrollId.toUpperCase();
		const employeeName = user.name;

		// Ambil daftar kunci jawaban pre-test dari DB
		let questions: any[] = [];
		try {
			questions = await sql`
				SELECT id, correct_key FROM hris.lms_quiz_questions
				WHERE course_id = ${courseId} AND quiz_type = 'PRE_TEST'
				ORDER BY id ASC;
			`;
		} catch (e) {
			console.error('DB query error in submitPreTest:', e);
		}

		let totalQ = questions.length;
		let correctCount = 0;

		if (totalQ > 0) {
			for (const q of questions) {
				const userAns = formData.get(`pre_${q.id}`)?.toString();
				if (userAns && userAns.toUpperCase() === q.correct_key.toUpperCase()) {
					correctCount++;
				}
			}
		} else {
			// Fallback jika tidak ada soal di DB
			totalQ = 2;
			if (formData.get('pre_901') === 'A') correctCount++;
			if (formData.get('pre_902') === 'A') correctCount++;
		}

		const score = Math.round((correctCount / Math.max(1, totalQ)) * 100);

		try {
			// Simpan / Upsert ke hris.lms_enrollments
			await sql`
				INSERT INTO hris.lms_enrollments (
					course_id, payroll_id, employee_name, status, progress_percent,
					completed_modules_count, total_modules_count, pre_test_score, enrolled_at
				) VALUES (
					${courseId}, ${payrollId}, ${employeeName}, 'IN_PROGRESS', 15,
					0, 4, ${score}, CURRENT_TIMESTAMP
				)
				ON CONFLICT (course_id, payroll_id) DO UPDATE SET
					pre_test_score = ${score},
					status = CASE WHEN hris.lms_enrollments.status = 'COMPLETED' THEN 'COMPLETED' ELSE 'IN_PROGRESS' END;
			`;

			return {
				success: true,
				actionType: 'PRE_TEST',
				score,
				step: 2,
				message: `Pre-Test berhasil dikumpulkan! Nilai baseline Anda: ${score}/100. Silakan lanjutkan mempelajari materi modul.`
			};
		} catch (err: any) {
			console.error('Error saving pre-test:', err);
			return {
				success: false,
				actionType: 'PRE_TEST',
				message: `Gagal menyimpan hasil Pre-Test: ${err?.message || 'Error database'}`
			};
		}
	},

	// ══════════════════════════════════════════════════════════════
	// STEP 2: UPDATE PROGRES SELESAI MODUL (BAB BELAJAR)
	// ══════════════════════════════════════════════════════════════
	updateModuleProgress: async ({ request, params, cookies }) => {
		const user = getSessionUser(cookies);

		const formData = await request.formData();
		const courseId = params.id;
		const payrollId = user.payrollId.toUpperCase();
		const completedIdx = Number(formData.get('moduleIndex')) + 1 || 1;
		const totalModules = Number(formData.get('totalModules')) || 4;

		const progressPercent = Math.min(80, Math.round((completedIdx / totalModules) * 65) + 15);

		try {
			await sql`
				UPDATE hris.lms_enrollments
				SET 
					completed_modules_count = GREATEST(COALESCE(completed_modules_count, 0), ${completedIdx}),
					progress_percent = GREATEST(COALESCE(progress_percent, 0), ${progressPercent}),
					status = 'IN_PROGRESS'
				WHERE course_id = ${courseId} AND UPPER(payroll_id) = ${payrollId};
			`;
			return { success: true, completedIdx };
		} catch (e: any) {
			return { success: false, message: e?.message };
		}
	},

	// ══════════════════════════════════════════════════════════════
	// STEP 3: SUBMIT POST-TEST (EVALUASI KELULUSAN KURSUS)
	// ══════════════════════════════════════════════════════════════
	submitPostTest: async ({ request, params, cookies }) => {
		const user = getSessionUser(cookies);

		const formData = await request.formData();
		const courseId = params.id;
		const payrollId = user.payrollId.toUpperCase();

		let questions: any[] = [];
		try {
			questions = await sql`
				SELECT id, correct_key FROM hris.lms_quiz_questions
				WHERE course_id = ${courseId} AND quiz_type = 'POST_TEST'
				ORDER BY id ASC;
			`;
		} catch (e) {
			console.error('DB query error in submitPostTest:', e);
		}

		let totalQ = questions.length;
		let correctCount = 0;

		if (totalQ > 0) {
			for (const q of questions) {
				const userAns = formData.get(`post_${q.id}`)?.toString();
				if (userAns && userAns.toUpperCase() === q.correct_key.toUpperCase()) {
					correctCount++;
				}
			}
		} else {
			totalQ = 3;
			if (formData.get('post_911') === 'A') correctCount++;
			if (formData.get('post_912') === 'A') correctCount++;
			if (formData.get('post_913') === 'A') correctCount++;
		}

		const score = Math.round((correctCount / Math.max(1, totalQ)) * 100);
		const passingGrade = 75;
		const isPassed = score >= passingGrade;

		try {
			await sql`
				UPDATE hris.lms_enrollments
				SET 
					post_test_score = ${score},
					progress_percent = ${isPassed ? 90 : 70}
				WHERE course_id = ${courseId} AND UPPER(payroll_id) = ${payrollId};
			`;

			if (isPassed) {
				return {
					success: true,
					actionType: 'POST_TEST',
					isPassed: true,
					score,
					step: 4,
					message: `Selamat! Anda Lulus Post-Test dengan Nilai ${score}/100. Silakan lengkapi Evaluasi Kepuasan (Level 1) untuk menerbitkan E-Sertifikat resmi.`
				};
			} else {
				return {
					success: false,
					actionType: 'POST_TEST',
					isPassed: false,
					score,
					step: 3,
					message: `Nilai Anda ${score}/100 (Belum mencapai Passing Grade ${passingGrade}). Silakan pelajari kembali modul materi atau lakukan remedial Post-Test.`
				};
			}
		} catch (err: any) {
			return {
				success: false,
				actionType: 'POST_TEST',
				message: `Gagal menyimpan Post-Test: ${err?.message || 'Error database'}`
			};
		}
	},

	// ══════════════════════════════════════════════════════════════
	// STEP 4: SUBMIT EVALUASI LEVEL 1 & GENERATE E-SERTIFIKAT (STEP 5)
	// ══════════════════════════════════════════════════════════════
	submitEvaluationL1: async ({ request, params, cookies }) => {
		const user = getSessionUser(cookies);

		const formData = await request.formData();
		const courseId = params.id;
		const payrollId = user.payrollId.toUpperCase();
		const employeeName = user.name;

		// 1. Ekstrak 15 Butir Skor Likert (1 - 5)
		const m1 = Math.min(5, Math.max(1, Number(formData.get('m1')) || 5));
		const m2 = Math.min(5, Math.max(1, Number(formData.get('m2')) || 5));
		const m3 = Math.min(5, Math.max(1, Number(formData.get('m3')) || 5));
		const m4 = Math.min(5, Math.max(1, Number(formData.get('m4')) || 5));
		const m5 = Math.min(5, Math.max(1, Number(formData.get('m5')) || 5));

		const i1 = Math.min(5, Math.max(1, Number(formData.get('i1')) || 5));
		const i2 = Math.min(5, Math.max(1, Number(formData.get('i2')) || 5));
		const i3 = Math.min(5, Math.max(1, Number(formData.get('i3')) || 5));
		const i4 = Math.min(5, Math.max(1, Number(formData.get('i4')) || 5));

		const f1 = Math.min(5, Math.max(1, Number(formData.get('f1')) || 5));
		const f2 = Math.min(5, Math.max(1, Number(formData.get('f2')) || 5));
		const f3 = Math.min(5, Math.max(1, Number(formData.get('f3')) || 5));
		const f4 = Math.min(5, Math.max(1, Number(formData.get('f4')) || 5));
		const f5 = Math.min(5, Math.max(1, Number(formData.get('f5')) || 5));
		const f6 = Math.min(5, Math.max(1, Number(formData.get('f6')) || 5));

		// 2. Ekstrak 3 Isian Kualitatif & Metode Pelatihan
		const appliedBenefit = formData.get('appliedBenefit')?.toString().trim() || 'Materi relevan dan dapat langsung diterapkan dalam operasional kerja harian.';
		const impressions = formData.get('impressions')?.toString().trim() || 'Pelatihan berlangsung sangat baik, terstruktur, dan aplikatif.';
		const suggestions = formData.get('suggestions')?.toString().trim() || 'Pertahankan materi yang interaktif dan studi kasus nyata.';
		const deliveryMethod = formData.get('deliveryMethod')?.toString().trim() || 'Online';

		// 3. Kalkulasi Rata-rata per Aspek & Skor Menyeluruh
		const materialScore = (m1 + m2 + m3 + m4 + m5) / 5;
		const instructorScore = (i1 + i2 + i3 + i4) / 4;
		const facilityScore = (f1 + f2 + f3 + f4 + f5 + f6) / 6;
		const overallScore = (m1 + m2 + m3 + m4 + m5 + i1 + i2 + i3 + i4 + f1 + f2 + f3 + f4 + f5 + f6) / 15;

		const answers = {
			m1, m2, m3, m4, m5,
			i1, i2, i3, i4,
			f1, f2, f3, f4, f5, f6,
			appliedBenefit,
			impressions,
			suggestions
		};

		const legacyFeedback = suggestions || impressions || appliedBenefit;

		try {
			// 1. Simpan Evaluasi Kepuasan Kirkpatrick Level 1 (Lengkap 18 Butir)
			await sql`
				INSERT INTO hris.lms_evaluations_l1 (
					course_id, payroll_id, employee_name,
					content_rating, instructor_rating, facility_rating, recommendation_rating, feedback_notes,
					delivery_method, material_score, instructor_score, facility_score, overall_score,
					applied_benefit, impressions, suggestions, answers, submitted_at
				) VALUES (
					${courseId}, ${payrollId}, ${employeeName},
					${Math.round(materialScore)}, ${Math.round(instructorScore)}, ${Math.round(facilityScore)}, ${Math.round(overallScore)}, ${legacyFeedback},
					${deliveryMethod}, ${Number(materialScore.toFixed(2))}, ${Number(instructorScore.toFixed(2))}, ${Number(facilityScore.toFixed(2))}, ${Number(overallScore.toFixed(2))},
					${appliedBenefit}, ${impressions}, ${suggestions}, ${JSON.stringify(answers)}, CURRENT_TIMESTAMP
				);
			`;

			// 2. Ambil detail kursus & skor akhir Post-Test
			const cRows = await sql`SELECT title, category FROM hris.lms_courses WHERE id = ${courseId} LIMIT 1`;
			const courseTitle = cRows[0]?.title || 'Training Program';
			const courseCat = cRows[0]?.category || 'Operations';

			const enrollRows = await sql`SELECT post_test_score FROM hris.lms_enrollments WHERE course_id = ${courseId} AND UPPER(payroll_id) = ${payrollId} LIMIT 1`;
			const finalScore = Number(enrollRows[0]?.post_test_score || 85);

			// 3. Generate Nomor Sertifikat Digital Resmi
			const certSeq = Math.floor(1000 + Math.random() * 9000);
			const certNumber = `CERT-BCS-2026-${certSeq}`;
			const qrUrl = `https://academy.bcslabs.tech/verify/${certNumber}`;

			// Tanggal terbit & masa berlaku 1 tahun persis
			const issueDate = new Date();
			const validUntilDate = new Date(issueDate);
			validUntilDate.setFullYear(validUntilDate.getFullYear() + 1);

			// 4. Simpan ke hris.lms_certificates dengan Masa Berlaku 1 TAHUN
			await sql`
				INSERT INTO hris.lms_certificates (
					certificate_number, payroll_id, employee_name, course_id, course_title,
					category, score, issued_at, valid_until, qr_verify_url
				) VALUES (
					${certNumber}, ${payrollId}, ${employeeName}, ${courseId}, ${courseTitle},
					${courseCat}, ${finalScore}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 year', ${qrUrl}
				)
				ON CONFLICT (certificate_number) DO NOTHING;
			`;

			// 5. Jadwalkan Evaluasi Perilaku Lapangan (Level 3 & 4) untuk Atasan (H+3 Bulan)
			await sql`
				INSERT INTO hris.lms_evaluations_l3_l4 (
					course_id, payroll_id, employee_name, supervisor_name, due_date, status
				) VALUES (
					${courseId}, ${payrollId}, ${employeeName}, 'Supervisor Operasional Lapangan',
					CURRENT_DATE + INTERVAL '3 months', 'PENDING'
				);
			`;

			// 6. Tandai Enrollment Selesai (COMPLETED, Progress 100%)
			await sql`
				UPDATE hris.lms_enrollments
				SET 
					status = 'COMPLETED',
					progress_percent = 100,
					completed_at = CURRENT_TIMESTAMP,
					has_certificate = TRUE,
					certificate_number = ${certNumber}
				WHERE course_id = ${courseId} AND UPPER(payroll_id) = ${payrollId};
			`;

			// 7. Update counter kursus
			await sql`
				UPDATE hris.lms_courses
				SET enrolled_count = enrolled_count + 1, updated_at = CURRENT_TIMESTAMP
				WHERE id = ${courseId};
			`;

			const certificateData = {
				certificateNumber: certNumber,
				payrollId,
				employeeName,
				courseId,
				courseTitle,
				category: courseCat,
				score: finalScore,
				issuedAt: issueDate.toISOString().split('T')[0],
				validUntil: validUntilDate.toISOString().split('T')[0],
				qrVerifyUrl: qrUrl
			};

			return {
				success: true,
				actionType: 'EVALUATION_L1',
				step: 5,
				certificate: certificateData,
				message: `Selamat! Evaluasi kepuasan telah diterima dan E-Sertifikat Resmi ${certNumber} (Masa Berlaku 1 Tahun) telah berhasil diterbitkan!`
			};
		} catch (err: any) {
			console.error('Error submitting evaluation and issuing certificate:', err);
			return {
				success: false,
				actionType: 'EVALUATION_L1',
				message: `Gagal menerbitkan sertifikat: ${err?.message || 'Error database'}`
			};
		}
	}
} satisfies Actions;
