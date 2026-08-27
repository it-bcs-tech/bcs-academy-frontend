import type { Course, Enrollment, Certificate } from '$lib/types/academy';

export const COURSES_CATALOG: Course[] = [
	{
		id: 'CRS-LOG-001',
		title: 'Defensive Driving & Road Safety Certification',
		category: 'Operations',
		level: 'Mandatory',
		durationHours: 3.5,
		modulesCount: 5,
		enrolledCount: 86,
		completionRate: 95,
		rating: 4.9,
		instructor: 'Capt. Rahmat Hidayat (Head of Safety)',
		description: 'Standar keselamatan berkendara angkutan berat jarak jauh, identifikasi titik buta (blind spot), teknik pengereman beban berat di turunan terjal, dan tanggap darurat kecelakaan.',
		tags: ['Driver', 'K3', 'Mandatory'],
		modules: [
			{ id: 'M1', sequence: 1, title: 'Prinsip Dasar Defensive Driving & Titik Buta (Blind Spot)', type: 'VIDEO', durationText: '25 Menit', completed: true },
			{ id: 'M2', sequence: 2, title: 'Pemeriksaan Pra-Jalan (P2H) Kendaraan Berat & Rem Angin', type: 'INTERACTIVE', durationText: '30 Menit', completed: true },
			{ id: 'M3', sequence: 3, title: 'Prosedur Kecepatan Maksimum & Jarak Aman di Jalan Tol', type: 'DOCUMENT', durationText: '25 Menit', completed: true },
			{ id: 'M4', sequence: 4, title: 'Penanganan Kondisi Darurat (Rem Blong & Pecah Ban)', type: 'VIDEO', durationText: '40 Menit', completed: true },
			{ id: 'M5', sequence: 5, title: 'Evaluasi Akhir & Post-Test Kelulusan', type: 'QUIZ', durationText: '30 Menit', completed: false }
		]
	},
	{
		id: 'CRS-ERP-004',
		title: 'Panduan Operasional Mobile Apps Driver & ERP Core BCS',
		category: 'Digital Systems',
		level: 'Mandatory',
		durationHours: 1.5,
		modulesCount: 3,
		enrolledCount: 110,
		completionRate: 98,
		rating: 4.9,
		instructor: 'Tim IT & Transformasi Digital',
		description: 'Tata cara login aplikasi mobile driver, pembaruan status surat jalan, foto bukti POD (Proof of Delivery), pelaporan kendala rute, dan klaim kasbon uang jalan (UJO).',
		tags: ['All Staff', 'ERP', 'Driver'],
		modules: [
			{ id: 'M1', sequence: 1, title: 'Navigasi Antarmuka Mobile Driver & Fitur Peta', type: 'VIDEO', durationText: '30 Menit', completed: true },
			{ id: 'M2', sequence: 2, title: 'Upload Bukti POD (Proof of Delivery) & Kasbon UJO', type: 'INTERACTIVE', durationText: '30 Menit', completed: true },
			{ id: 'M3', sequence: 3, title: 'Post-Test Pemahaman Fitur Aplikasi', type: 'QUIZ', durationText: '30 Menit', completed: true }
		]
	},
	{
		id: 'CRS-K3-002',
		title: 'K3 Pergudangan & Penanganan Material B3',
		category: 'QHSE & Safety',
		level: 'Mandatory',
		durationHours: 2,
		modulesCount: 4,
		enrolledCount: 54,
		completionRate: 91,
		rating: 4.8,
		instructor: 'Ir. Dewi Lestari, ST (QHSE Manager)',
		description: 'Pedoman keselamatan di gudang logistik, penggunaan APD wajib, identifikasi simbol B3 (MSDS), pengoperasian forklift aman, serta penanganan tumpahan kimia.',
		tags: ['Warehouse', 'B3', 'QHSE'],
		modules: [
			{ id: 'M1', sequence: 1, title: 'Pengenalan Regulasi K3 & Simbol Bahaya B3', type: 'VIDEO', durationText: '20 Menit', completed: true },
			{ id: 'M2', sequence: 2, title: 'SOP Pengoperasian Forklift & Pallet Stacker', type: 'VIDEO', durationText: '35 Menit', completed: false },
			{ id: 'M3', sequence: 3, title: 'Simulasi Spill Kit & Kebocoran Bahan Kimia', type: 'INTERACTIVE', durationText: '35 Menit', completed: false },
			{ id: 'M4', sequence: 4, title: 'Kuis Kepatuhan K3 & B3', type: 'QUIZ', durationText: '30 Menit', completed: false }
		]
	},
	{
		id: 'CRS-MTC-003',
		title: 'Preventive Maintenance Mesin Truk Diesel Euro 4',
		category: 'Technical',
		level: 'Intermediate',
		durationHours: 4,
		modulesCount: 5,
		enrolledCount: 24,
		completionRate: 85,
		rating: 4.7,
		instructor: 'Miswanto (Workshop Head)',
		description: 'SOP perawatan berkala mesin diesel common rail Euro 4, diagnosis kelistrikan, sistem suspensi udara, dan integrasi pengisian tiket Work Order digital.',
		tags: ['Mechanic', 'Maintenance'],
		modules: [
			{ id: 'M1', sequence: 1, title: 'Arsitektur Engine Euro 4 & Sensor Elektronik', type: 'VIDEO', durationText: '45 Menit', completed: false },
			{ id: 'M2', sequence: 2, title: 'Diagnostik Kerusakan OBD-II & Scantool', type: 'INTERACTIVE', durationText: '60 Menit', completed: false },
			{ id: 'M3', sequence: 3, title: 'Maintenance Sistem Rem Angin & Suspensi Udara', type: 'VIDEO', durationText: '50 Menit', completed: false },
			{ id: 'M4', sequence: 4, title: 'SOP Digital Work Order di ERP', type: 'DOCUMENT', durationText: '35 Menit', completed: false },
			{ id: 'M5', sequence: 5, title: 'Uji Kompetensi Mekanik Tahap 1', type: 'QUIZ', durationText: '50 Menit', completed: false }
		]
	},
	{
		id: 'CRS-LDR-005',
		title: 'Effective Field Leadership & Incident Resolution',
		category: 'Leadership',
		level: 'Advanced',
		durationHours: 2.5,
		modulesCount: 4,
		enrolledCount: 19,
		completionRate: 88,
		rating: 4.6,
		instructor: 'Agus Subroto (Head of Operations)',
		description: 'Kepemimpinan lapangan, manajemen konflik rute pengemudi, teknik negosiasi bongkar muat pelanggan, dan pelaporan SLA pengiriman.',
		tags: ['Supervisor', 'Management'],
		modules: [
			{ id: 'M1', sequence: 1, title: 'Komunikasi Efektif & Empati Lapangan', type: 'VIDEO', durationText: '35 Menit', completed: false },
			{ id: 'M2', sequence: 2, title: 'Decision Making saat Cuaca Buruk di Pantura', type: 'DOCUMENT', durationText: '40 Menit', completed: false },
			{ id: 'M3', sequence: 3, title: 'Evaluasi SLA Pengiriman & Root Cause Analysis', type: 'INTERACTIVE', durationText: '45 Menit', completed: false },
			{ id: 'M4', sequence: 4, title: 'Studi Kasus & Assessment Kepemimpinan', type: 'QUIZ', durationText: '30 Menit', completed: false }
		]
	}
];

export const MOCK_CERTIFICATES: Certificate[] = [
	{
		certificateNumber: 'CERT-BCS-2026-0889',
		payrollId: 'EMP-0042',
		employeeName: 'GUNTORO MUHAMAD',
		courseId: 'CRS-ERP-004',
		courseTitle: 'Panduan Operasional Mobile Apps Driver & ERP Core BCS',
		category: 'Digital Systems',
		score: 95,
		issuedAt: '22 Agustus 2026',
		qrVerifyUrl: 'https://academy.bcslabs.tech/verify/CERT-BCS-2026-0889'
	}
];
