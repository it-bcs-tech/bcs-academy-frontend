import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { authenticateEmployee, encodeSession } from '$lib/server/auth';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('bcs_academy_token');
	if (token) {
		throw redirect(303, '/');
	}
	return {};
};

export const actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString().trim();
		const password = formData.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { message: 'Alamat email Presensi dan kata sandi wajib diisi.' });
		}

		const user = await authenticateEmployee(email, password);
		if (!user) {
			return fail(401, { message: 'Email atau kata sandi tidak sesuai, atau akun Presensi tidak aktif.' });
		}

		// Set cookie session (7 days)
		// secure diset false agar browser dapat menyimpan cookie saat portal diakses via protokol HTTP di server Biznet
		const token = encodeSession(user);
		cookies.set('bcs_academy_token', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false,
			maxAge: 60 * 60 * 24 * 7
		});

		throw redirect(303, '/');
	},

	logout: async ({ cookies }) => {
		cookies.delete('bcs_academy_token', { path: '/' });
		throw redirect(303, '/login');
	}
} satisfies Actions;
