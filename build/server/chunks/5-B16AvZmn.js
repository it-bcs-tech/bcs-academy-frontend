import { C as COURSES_CATALOG } from './mockData-DkkROE01.js';
import { r as redirect, e as error } from './index-CRFfcpCQ.js';
import './index-DBqjc0Yf.js';

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

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 5;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-6RQ_oViI.js')).default;
const server_id = "src/routes/courses/[id]/+page.server.ts";
const imports = ["_app/immutable/nodes/5.Bl-y5HzI.js","_app/immutable/chunks/Ce3Kyutj.js","_app/immutable/chunks/M-3i9LdT.js","_app/immutable/chunks/cBdq8h7P.js","_app/immutable/chunks/v_jBEYI6.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=5-B16AvZmn.js.map
