import { t as COURSES_CATALOG } from "../../../chunks/mockData.js";
import { redirect } from "@sveltejs/kit";
//#region src/routes/catalog/+page.server.ts
var load = async ({ parent }) => {
	const { user } = await parent();
	if (!user) throw redirect(303, "/login");
	return { catalog: COURSES_CATALOG };
};
//#endregion
export { load };
