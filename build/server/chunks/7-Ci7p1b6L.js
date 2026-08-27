import { r as redirect } from './index-CRFfcpCQ.js';
import './index-DBqjc0Yf.js';

//#region src/routes/profile/+page.server.ts
var load = async ({ parent }) => {
	const { user } = await parent();
	if (!user) throw redirect(303, "/login");
	return { user };
};
var actions = { changePin: async ({ request }) => {
	const formData = await request.formData();
	const oldPin = formData.get("oldPin")?.toString();
	const newPin = formData.get("newPin")?.toString();
	const confirmPin = formData.get("confirmPin")?.toString();
	if (!oldPin || !newPin || !confirmPin) return {
		success: false,
		message: "Semua kolom PIN wajib diisi."
	};
	if (newPin.length !== 6) return {
		success: false,
		message: "PIN baru harus tepat 6 digit angka."
	};
	if (newPin !== confirmPin) return {
		success: false,
		message: "Konfirmasi PIN baru tidak sesuai."
	};
	return {
		success: true,
		message: "PIN Keamanan Anda berhasil diperbarui."
	};
} };

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 7;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CXPRpGYp.js')).default;
const server_id = "src/routes/profile/+page.server.ts";
const imports = ["_app/immutable/nodes/7.DN_jFHZl.js","_app/immutable/chunks/Ce3Kyutj.js","_app/immutable/chunks/M-3i9LdT.js","_app/immutable/chunks/cBdq8h7P.js","_app/immutable/chunks/v_jBEYI6.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=7-Ci7p1b6L.js.map
