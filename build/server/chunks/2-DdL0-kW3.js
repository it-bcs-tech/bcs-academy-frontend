import { M as MOCK_CERTIFICATES, C as COURSES_CATALOG } from './mockData-DkkROE01.js';
import { r as redirect } from './index-CRFfcpCQ.js';
import './index-DBqjc0Yf.js';

//#region src/routes/+page.server.ts
var load = async ({ parent }) => {
	const { user } = await parent();
	if (!user) throw redirect(303, "/login");
	return {
		enrollments: [
			{
				courseId: "CRS-LOG-001",
				course: COURSES_CATALOG[0],
				status: "IN_PROGRESS",
				progressPercent: 80,
				completedModulesCount: 4,
				totalModulesCount: 5,
				enrolledAt: "10 Agt 2026",
				deadline: "15 Sep 2026"
			},
			{
				courseId: "CRS-ERP-004",
				course: COURSES_CATALOG[1],
				status: "COMPLETED",
				progressPercent: 100,
				completedModulesCount: 3,
				totalModulesCount: 3,
				enrolledAt: "01 Agt 2026",
				completedAt: "22 Agt 2026",
				score: 95,
				hasCertificate: true,
				certificateNumber: "CERT-BCS-2026-0889"
			},
			{
				courseId: "CRS-K3-002",
				course: COURSES_CATALOG[2],
				status: "IN_PROGRESS",
				progressPercent: 25,
				completedModulesCount: 1,
				totalModulesCount: 4,
				enrolledAt: "15 Agt 2026",
				deadline: "30 Sep 2026"
			}
		],
		catalog: COURSES_CATALOG,
		certificates: MOCK_CERTIFICATES
	};
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 2;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BXSm59WC.js')).default;
const server_id = "src/routes/+page.server.ts";
const imports = ["_app/immutable/nodes/2.DfCs0M7d.js","_app/immutable/chunks/Ce3Kyutj.js","_app/immutable/chunks/v_jBEYI6.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=2-DdL0-kW3.js.map
