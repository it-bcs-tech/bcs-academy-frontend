import { t as COURSES_CATALOG } from "../../../../chunks/mockData.js";
import { error, redirect } from "@sveltejs/kit";
//#region src/routes/courses/[id]/+page.server.ts
var load = async ({ params, parent }) => {
	const { user } = await parent();
	if (!user) throw redirect(303, "/login");
	const course = COURSES_CATALOG.find((c) => c.id === params.id) || COURSES_CATALOG[0];
	if (!course) throw error(404, "Kursus tidak ditemukan");
	return { course };
};
var actions = { submitQuiz: async ({ request, params }) => {
	const formData = await request.formData();
	const q1 = formData.get("q1")?.toString();
	const q2 = formData.get("q2")?.toString();
	let score = 0;
	if (q1 === "A") score += 50;
	if (q2 === "A") score += 50;
	const isPassed = score >= 80;
	return {
		success: true,
		score,
		isPassed,
		message: isPassed ? `Selamat! Anda Lulus dengan Nilai ${score}/100. Sertifikat resmi telah diterbitkan.` : `Nilai Anda ${score}/100 (Belum Lulus). Silakan pelajari kembali materi dan ulangi kuis.`
	};
} };
//#endregion
export { actions, load };
