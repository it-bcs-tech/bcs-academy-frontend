import { a as authenticateEmployee, e as encodeSession } from './auth-pcD1PfiB.js';
import { r as redirect, f as fail } from './index-CRFfcpCQ.js';
import 'postgres';
import './index-DBqjc0Yf.js';

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
		const user = await authenticateEmployee(payrollId);
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

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 6;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CjkkEzwU.js')).default;
const server_id = "src/routes/login/+page.server.ts";
const imports = ["_app/immutable/nodes/6.CieI1-ho.js","_app/immutable/chunks/Ce3Kyutj.js","_app/immutable/chunks/M-3i9LdT.js","_app/immutable/chunks/cBdq8h7P.js","_app/immutable/chunks/v_jBEYI6.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=6-DXMIm18_.js.map
