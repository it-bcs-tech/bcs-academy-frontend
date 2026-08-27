import { r as encodeSession, t as authenticateEmployee } from "../../../chunks/auth.js";
import { fail, redirect } from "@sveltejs/kit";
//#region src/routes/login/+page.server.ts
var load = async ({ cookies }) => {
	if (cookies.get("bcs_academy_token")) throw redirect(303, "/");
	return {};
};
var actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const payrollId = formData.get("payrollId")?.toString().trim();
		const pin = formData.get("pin")?.toString().trim();
		if (!payrollId || !pin) return fail(400, { message: "Nomor NIK/Payroll ID dan PIN wajib diisi." });
		const user = await authenticateEmployee(payrollId, pin);
		if (!user) return fail(401, { message: "Identitas NIK atau PIN tidak ditemukan. Hubungi HR/TnD." });
		const token = encodeSession(user);
		cookies.set("bcs_academy_token", token, {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			maxAge: 3600 * 24 * 7
		});
		throw redirect(303, "/");
	},
	logout: async ({ cookies }) => {
		cookies.delete("bcs_academy_token", { path: "/" });
		throw redirect(303, "/login");
	}
};
//#endregion
export { actions, load };
