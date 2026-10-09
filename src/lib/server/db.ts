/**
 * db.ts — Singleton PostgreSQL Client untuk BCS Academy Employee Portal
 * Koneksi ke database PostgreSQL mybcs_db (Docker)
 */

import postgres from 'postgres';

const DATABASE_URL =
	process.env.DATABASE_URL ??
	'postgresql://bcs_admin:sangatrahasia@103.31.205.199:5433/mybcs_db';

const sql = postgres(DATABASE_URL, {
	max: 5,
	idle_timeout: 30,
	connect_timeout: 10
});

export default sql;
