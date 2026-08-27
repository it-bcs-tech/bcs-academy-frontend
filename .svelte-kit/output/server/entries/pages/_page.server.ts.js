import { n as MOCK_CERTIFICATES, t as COURSES_CATALOG } from "../../chunks/mockData.js";
import { redirect } from "@sveltejs/kit";
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
//#endregion
export { load };
