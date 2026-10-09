/**
 * BCS Academy — Employee Authentication Service (master.m_presensi)
 * ══════════════════════════════════════════════════════════════════════
 * Terintegrasi langsung dengan database PostgreSQL tabel master.m_presensi
 * dan master.m_karyawan untuk validasi kredensial Email & Bcrypt Password.
 */

import sql from '$lib/server/db';
import bcrypt from 'bcryptjs';
import type { EmployeeUser } from '$lib/types/academy';

/**
 * Autentikasi Karyawan menggunakan Email Presensi dan Password Bcrypt
 */
export async function authenticateEmployee(email: string, password: string): Promise<EmployeeUser | null> {
	const cleanEmail = email.trim().toLowerCase();
	if (!cleanEmail || !password) {
		return null;
	}

	try {
		const rows = await sql`
			SELECT 
				mp.id as presensi_id,
				mp.email,
				mp.password,
				mp.is_active,
				mp.karyawan_id,
				COALESCE(mk.nama_karyawan, mp.name) as name,
				mk.payroll_id,
				mk.div_id,
				md.div_name,
				mt.title as title_name,
				ml.level_sequence,
				COALESCE(mp.phone, mk.telp1) as phone
			FROM master.m_presensi mp
			LEFT JOIN master.m_karyawan mk ON mk.id = mp.karyawan_id
			LEFT JOIN master.m_division md ON md.div_code = mk.div_id
			LEFT JOIN master.m_title mt ON mt.title_code = mk.title
			LEFT JOIN master.m_level ml ON ml.level_code = mk.level
			WHERE LOWER(TRIM(mp.email)) = ${cleanEmail}
			LIMIT 1
		`;

		if (!rows || rows.length === 0) {
			return null;
		}

		const userRow = rows[0];

		// Cek apakah akun aktif
		if (userRow.is_active === false) {
			return null;
		}

		// Validasi kata sandi Bcrypt
		const storedHash = userRow.password;
		if (!storedHash) {
			return null;
		}

		// Normalisasi hash $2y$ (PHP/Laravel) ke $2a$ untuk kompatibilitas penuh bcryptjs
		const normalizedHash = storedHash.startsWith('$2y$')
			? storedHash.replace(/^\$2y\$/, '$2a$')
			: storedHash;

		const isMatch = bcrypt.compareSync(password, normalizedHash);
		if (!isMatch) {
			return null;
		}

		return {
			id: Number(userRow.karyawan_id || userRow.presensi_id),
			payrollId: userRow.payroll_id || `P-${userRow.presensi_id}`,
			name: userRow.name || 'Karyawan BCS',
			email: userRow.email,
			division: userRow.div_name || 'Operasional',
			divisionCode: userRow.div_id || 'DV_41',
			title: userRow.title_name || 'Karyawan',
			levelSequence: Number(userRow.level_sequence) || 1,
			phone: userRow.phone || ''
		};
	} catch (e) {
		console.error('Error authenticating employee with DB:', e);
		return null;
	}
}

export function encodeSession(user: EmployeeUser): string {
	return Buffer.from(JSON.stringify(user)).toString('base64');
}

export function decodeSession(token: string): EmployeeUser | null {
	try {
		const json = Buffer.from(token, 'base64').toString('utf-8');
		return JSON.parse(json);
	} catch (e) {
		return null;
	}
}
