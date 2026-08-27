import { n as MOCK_CERTIFICATES } from "../../../chunks/mockData.js";
import { redirect } from "@sveltejs/kit";
//#region src/routes/certificates/+page.server.ts
var load = async ({ parent }) => {
	const { user } = await parent();
	if (!user) throw redirect(303, "/login");
	return { certificates: MOCK_CERTIFICATES };
};
//#endregion
export { load };
