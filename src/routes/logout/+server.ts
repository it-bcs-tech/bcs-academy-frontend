import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function clearSessionAndRedirect(cookies: any) {
	cookies.delete('bcs_academy_token', { path: '/', secure: false });
	cookies.set('bcs_academy_token', '', {
		path: '/',
		maxAge: 0,
		expires: new Date(0),
		secure: false,
		httpOnly: true,
		sameSite: 'lax'
	});
	throw redirect(303, '/login');
}

export const GET: RequestHandler = async ({ cookies }) => {
	clearSessionAndRedirect(cookies);
};

export const POST: RequestHandler = async ({ cookies }) => {
	clearSessionAndRedirect(cookies);
};
