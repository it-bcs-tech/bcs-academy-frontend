import { redirect } from "@sveltejs/kit";
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
//#endregion
export { actions, load };
