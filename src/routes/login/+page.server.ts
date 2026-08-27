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
		const payrollId = formData.get('payrollId')?.toString().trim();
		const pin = formData.get('pin')?.toString().trim();

		if (!payrollId || !pin) {
			return fail(400, { message: 'Nomor NIK/Payroll ID dan PIN wajib diisi.' });
		}

		const user = await authenticateEmployee(payrollId, pin);
		if (!user) {
			return fail(401, { message: 'Identitas NIK atau PIN tidak ditemukan. Hubungi HR/TnD.' });
		}

		// Set cookie session (7 days)
		const token = encodeSession(user);
		cookies.set('bcs_academy_token', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7
		});

		throw redirect(303, '/');
	},

	logout: async ({ cookies }) => {
		cookies.delete('bcs_academy_token', { path: '/' });
		throw redirect(303, '/login');
	}
} satisfies Actions;
