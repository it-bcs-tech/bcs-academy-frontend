/**
 * BCS Academy — Engine Manajemen Jadwal Pelatihan & Countdown Dinamis
 * ══════════════════════════════════════════════════════════════════════
 */

export interface CourseScheduleState {
	sessionId: string;
	sessionTitle: string;
	sessionDate: string; // YYYY-MM-DD
	startTime: string; // HH:mm
	endTime: string; // HH:mm
	sessionType: string; // OFFLINE, ONLINE_ZOOM, WEBINAR
	locationOrLink?: string;
	trainer: string;
	hasSchedule: boolean;
	isStarted: boolean;
	isEnded: boolean;
	countdownText: string;
	formattedDate: string;
	isLocked: boolean;
	statusMessage: string;
}

/**
 * Format teks hitung mundur relatif yang ramah pengguna
 * Contoh output:
 * - "2 bulan lagi" (jika >= 30 hari)
 * - "2 minggu lagi" (jika >= 7 hari)
 * - "1 hari 5 jam lagi" (jika >= 1 hari)
 * - "1 hari lagi" (jika jam 0)
 * - "1 jam 30 menit lagi" (jika >= 1 jam)
 * - "1 jam lagi" (jika menit 0)
 * - "30 menit lagi" (jika < 1 jam)
 * - "Kurang dari 1 menit lagi" (jika < 1 menit)
 */
export function formatCountdownFromDiff(diffMs: number): string {
	if (diffMs <= 0) return 'Sesi Berlangsung';

	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays >= 30) {
		const months = Math.floor(diffDays / 30);
		return `${months} bulan lagi`;
	}

	if (diffDays >= 7) {
		const weeks = Math.floor(diffDays / 7);
		return `${weeks} minggu lagi`;
	}

	if (diffDays >= 1) {
		const remHours = diffHours % 24;
		if (remHours > 0) {
			return `${diffDays} hari ${remHours} jam lagi`;
		}
		return `${diffDays} hari lagi`;
	}

	if (diffHours >= 1) {
		const remMins = diffMinutes % 60;
		if (remMins > 0) {
			return `${diffHours} jam ${remMins} menit lagi`;
		}
		return `${diffHours} jam lagi`;
	}

	if (diffMinutes >= 1) {
		return `${diffMinutes} menit lagi`;
	}

	return 'Kurang dari 1 menit lagi';
}

/**
 * Format tanggal Indonesia ramah pengguna: "20 Nov 2026, 09:00 WIB"
 */
export function formatIndonesianDateTime(dateStr: string, timeStr?: string): string {
	try {
		const d = new Date(dateStr);
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
		const day = String(d.getDate()).padStart(2, '0');
		const month = months[d.getMonth()] || '';
		const year = d.getFullYear();
		const time = (timeStr || '08:00').substring(0, 5);
		return `${day} ${month} ${year}, ${time} WIB`;
	} catch {
		return `${dateStr} ${timeStr || ''}`.trim();
	}
}

/**
 * Evaluasi status jadwal kursus untuk seorang karyawan
 */
export function evaluateCourseSchedule(
	session: {
		session_id?: string;
		sessionId?: string;
		title?: string;
		session_title?: string;
		sessionTitle?: string;
		session_date?: string | Date;
		sessionDate?: string | Date;
		start_time?: string;
		startTime?: string;
		end_time?: string;
		endTime?: string;
		session_type?: string;
		sessionType?: string;
		location_or_link?: string;
		locationOrLink?: string;
		trainer?: string;
	} | null | undefined,
	courseStatus?: string | null
): CourseScheduleState {
	const isCompleted = courseStatus === 'COMPLETED';

	if (!session) {
		return {
			sessionId: '',
			sessionTitle: '',
			sessionDate: '',
			startTime: '',
			endTime: '',
			sessionType: 'OFFLINE',
			trainer: '',
			hasSchedule: false,
			isStarted: false,
			isEnded: false,
			countdownText: '',
			formattedDate: '',
			isLocked: !isCompleted,
			statusMessage: isCompleted ? 'Pelatihan Selesai' : 'Menunggu Jadwal Pelatihan dari HRD / TnD'
		};
	}

	const rawDate = session.session_date || session.sessionDate;
	let dateStr = '';
	if (rawDate instanceof Date) {
		dateStr = rawDate.toISOString().split('T')[0];
	} else if (typeof rawDate === 'string') {
		dateStr = rawDate.split('T')[0];
	}

	const startTime = (session.start_time || session.startTime || '08:00').substring(0, 5);
	const endTime = (session.end_time || session.endTime || '17:00').substring(0, 5);

	// Bangun objek waktu target lokal
	let targetTimeMs = 0;
	if (dateStr) {
		const [y, m, d] = dateStr.split('-').map(Number);
		const [h, min] = startTime.split(':').map(Number);
		// Asumsi waktu sistem lokal WIB
		const targetDate = new Date(y, (m || 1) - 1, d || 1, h || 8, min || 0, 0);
		targetTimeMs = targetDate.getTime();
	}

	const nowMs = Date.now();
	const diffMs = targetTimeMs - nowMs;
	const isStarted = diffMs <= 0;

	// Cek apakah waktu akhir sudah lewat (isEnded)
	let isEnded = false;
	if (dateStr) {
		const [y, m, d] = dateStr.split('-').map(Number);
		const [endH, endMin] = endTime.split(':').map(Number);
		const endDate = new Date(y, (m || 1) - 1, d || 1, endH || 17, endMin || 0, 0);
		isEnded = endDate.getTime() < nowMs;
	}

	const countdownText = isStarted ? 'Sesi Berlangsung' : formatCountdownFromDiff(diffMs);
	const formattedDate = formatIndonesianDateTime(dateStr, startTime);

	return {
		sessionId: session.session_id || session.sessionId || '',
		sessionTitle: session.title || session.session_title || session.sessionTitle || '',
		sessionDate: dateStr,
		startTime,
		endTime,
		sessionType: session.session_type || session.sessionType || 'OFFLINE',
		locationOrLink: session.location_or_link || session.locationOrLink,
		trainer: session.trainer || 'Internal Trainer BCS',
		hasSchedule: true,
		isStarted,
		isEnded,
		countdownText,
		formattedDate,
		isLocked: isCompleted ? false : !isStarted,
		statusMessage: isCompleted
			? 'Pelatihan Selesai'
			: isStarted
				? 'Sesi Pelatihan Sedang Berlangsung'
				: `Pelatihan dimulai dalam ${countdownText} (${formattedDate})`
	};
}
