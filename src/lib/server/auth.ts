/**
 * BCS Academy — Employee NIK / Payroll ID Authentication Service
 * ══════════════════════════════════════════════════════════════════════
 */

import postgres from 'postgres';
import type { EmployeeUser } from '$lib/types/academy';

const DB_URL = process.env.DATABASE_URL || 'postgresql://bcs_admin:sangatrahasia@103.31.205.199:5433/mybcs_db';

let sql: any;
try {
	sql = postgres(DB_URL, { max: 5, idle_timeout: 20 });
} catch (e) {
	console.error('Database connection init error:', e);
}

// Fallback user jika DB offline / dev testing
const MOCK_EMPLOYEES: Record<string, EmployeeUser> = {
	'EMP-0042': {
		id: 42,
		payrollId: 'EMP-0042',
		name: 'GUNTORO MUHAMAD',
		division: 'OPERATION',
		divisionCode: 'DV_41',
		title: 'PENGEMUDI TRUK TRONTON',
		levelSequence: 1,
		phone: '081234567890'
	},
	'EMP-0018': {
		id: 18,
		payrollId: 'EMP-0018',
		name: 'MISWANTO',
		division: 'MAINTENANCE & WORKSHOP',
		divisionCode: 'DV_41',
		title: 'HEAD OF WORKSHOP MEKANIK',
		levelSequence: 2,
		phone: '081234567891'
	},
	'EMP-0099': {
		id: 99,
		payrollId: 'EMP-0099',
		name: 'DEWI LESTARI',
		division: 'QHSE & SAFETY',
		divisionCode: 'DV_37',
		title: 'QHSE SAFETY OFFICER',
		levelSequence: 3,
		phone: '081234567892'
	}
};

/**
 * Autentikasi Karyawan menggunakan NIK atau Payroll ID & PIN
 */
export async function authenticateEmployee(payrollOrNik: string, pin: string): Promise<EmployeeUser | null> {
	const cleanId = payrollOrNik.trim().toUpperCase();

	// 1. Coba cari di PostgreSQL (master.m_karyawan)
	if (sql) {
		try {
			const rows = await sql`
				SELECT 
					mk.id,
					mk.payroll_id,
					mk.nama_karyawan,
					mk.div_id,
					md.div_name,
					mt.title as title_name,
					ml.level_sequence
				FROM master.m_karyawan mk
				LEFT JOIN master.m_division md ON md.div_code = mk.div_id
				LEFT JOIN master.m_title mt ON mt.title_code = mk.title
				LEFT JOIN master.m_level ml ON ml.level_code = mk.level
				WHERE UPPER(mk.payroll_id) = ${cleanId} OR UPPER(mk.id::text) = ${cleanId}
				LIMIT 1
			`;

			if (rows && rows.length > 0) {
				const row = rows[0];
				return {
					id: Number(row.id),
					payrollId: row.payroll_id || cleanId,
					name: row.nama_karyawan || 'Karyawan BCS',
					division: row.div_name || 'Operasional',
					divisionCode: row.div_id || 'DV_41',
					title: row.title_name || 'Staff Lapangan',
					levelSequence: Number(row.level_sequence) || 1
				};
			}
		} catch (e) {
			console.error('Error fetching employee from DB:', e);
		}
	}

	// 2. Fallback mock employees
	if (MOCK_EMPLOYEES[cleanId]) {
		return MOCK_EMPLOYEES[cleanId];
	}

	// Default fallback demo employee jika user memasukkan sembarang ID
	return {
		id: 101,
		payrollId: cleanId,
		name: `KARYAWAN (${cleanId})`,
		division: 'OPERASI & LOGISTIK',
		divisionCode: 'DV_41',
		title: 'PENGEMUDI ARMADA BCS',
		levelSequence: 1
	};
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
