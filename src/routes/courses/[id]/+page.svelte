<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import { formatEmbedUrl, detectEmbedPlatform } from '$lib/utils/embed';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const { course, preTestQuestions, postTestQuestions } = data;

	// State Tahapan Sequential Player (1: Pre-Test, 2: Modul, 3: Post-Test, 4: Evaluasi L1, 5: Sertifikat)
	let currentStep = $state<1 | 2 | 3 | 4 | 5>(data.initialStep || 1);
	let activeModuleIndex = $state(0);
	let currentModule = $derived(course.modules[activeModuleIndex] || course.modules[0] || {
		id: 'mod-1',
		title: 'Materi Pembelajaran',
		type: 'VIDEO',
		durationText: '15 Menit',
		contentUrl: ''
	});

	// Fullscreen State & Handlers
	let playerViewerRef = $state<HTMLElement | null>(null);
	let isFullscreen = $state(false);

	function toggleFullscreen() {
		if (!playerViewerRef) return;
		if (!document.fullscreenElement) {
			playerViewerRef.requestFullscreen().catch((err) => {
				console.error('Fullscreen request error:', err);
			});
		} else {
			document.exitFullscreen().catch((err) => {
				console.error('Fullscreen exit error:', err);
			});
		}
	}

	onMount(() => {
		const handleFsChange = () => {
			isFullscreen = Boolean(document.fullscreenElement);
		};
		document.addEventListener('fullscreenchange', handleFsChange);
		return () => {
			document.removeEventListener('fullscreenchange', handleFsChange);
		};
	});

	function isModulePdf(mod: any) {
		if (!mod) return false;
		return (
			mod.type === 'DOCUMENT' ||
			mod.type === 'PDF' ||
			Boolean(
				mod.contentUrl &&
				(mod.contentUrl.includes('.pdf') ||
				 mod.contentUrl.includes('drive.google.com') ||
				 mod.contentUrl.includes('docs.google.com')) &&
				mod.type !== 'VIDEO'
			)
		);
	}

	let isCurrentModulePdf = $derived(isModulePdf(currentModule));

	// State Jawaban & Evaluasi
	let preAnswers = $state<Record<string | number, string>>((data.enrollment?.preTestAnswers as Record<string, string>) || {});
	let postAnswers = $state<Record<string | number, string>>((data.enrollment?.postTestAnswers as Record<string, string>) || {});
	let isSubmitting = $state(false);

	// ══════════════════════════════════════════════════════════════
	// EVALUASI KIRKPATRICK LEVEL 1 (18 INDIKATOR STANDAR PT BCS)
	// ══════════════════════════════════════════════════════════════
	// 15 Butir Skala Likert 1-5 (Default 5 / Sangat Baik untuk kemudahan)
	let evalLikert = $state<Record<string, number>>({
		m1: 5, m2: 5, m3: 5, m4: 5, m5: 5,
		i1: 5, i2: 5, i3: 5, i4: 5,
		f1: 5, f2: 5, f3: 5, f4: 5, f5: 5, f6: 5
	});

	// 3 Pertanyaan Kualitatif / Esai Bebas
	let appliedBenefit = $state('SOP dan materi pelatihan dapat langsung diterapkan pada tugas kerja operasional rutin di unit.');
	let impressions = $state('Pelatihan sangat aplikatif, video modul jelas, dan pembelajaran mandiri berjalan lancar.');
	let suggestions = $state('Pertahankan kualitas modul interaktif dan perbanyak studi kasus langsung dari lapangan.');
	let deliveryMethod = $state('Online LMS');

	// Definisi 18 Indikator Master Kirkpatrick Level 1 PT BCS
	const materialQuestions = [
		{ id: 'm1', number: 1, title: 'Sistematika Materi Pelatihan', desc: 'Materi pelatihan tersusun secara runtut, logis, dan terstruktur dengan baik.' },
		{ id: 'm2', number: 2, title: 'Kelengkapan Bahan Ajar', desc: 'Kelengkapan modul bacaan, video panduan, dan referensi pendukung yang disajikan.' },
		{ id: 'm3', number: 3, title: 'Kesesuaian & Manfaat Praktis', desc: 'Materi relevan dan aplikatif dengan kebutuhan tugas pekerjaan operasional di lapangan.' },
		{ id: 'm4', number: 4, title: 'Alokasi & Manajemen Waktu', desc: 'Kesesuaian durasi waktu dan alokasi beban belajar yang diberikan pada modul.' },
		{ id: 'm5', number: 5, title: 'Peningkatan Kompetensi & Wawasan', desc: 'Memberikan tambahan wawasan, keterampilan, dan pemahaman baru yang nyata.' }
	];

	const instructorQuestions = [
		{ id: 'i1', number: 6, title: 'Penguasaan Materi oleh Instruktur', desc: 'Instruktur/trainer menguasai topik bahasan secara mendalam dan jelas.' },
		{ id: 'i2', number: 7, title: 'Metode & Gaya Penyampaian', desc: 'Bahasa dan artikulasi penyampaian materi mudah dipahami, menarik, dan lugas.' },
		{ id: 'i3', number: 8, title: 'Interaktivitas & Partisipasi', desc: 'Mampu menciptakan alur pembelajaran yang komunikatif dan fokus pada esensi materi.' },
		{ id: 'i4', number: 9, title: 'Kualitas Pembahasan & Studi Kasus', desc: 'Ketepatan dalam mengulas studi kasus, contoh operasional, dan materi kuis.' }
	];

	const facilityQuestions = [
		{ id: 'f1', number: 10, title: 'Kemudahan Navigasi Portal LMS', desc: 'Tampilan antarmuka sistem LMS mudah diakses dan responsif di berbagai perangkat.' },
		{ id: 'f2', number: 11, title: 'Kualitas Visual & Audio Modul', desc: 'Kejernihan gambar modul presentasi, format dokumen, dan kejernihan audio narasi.' },
		{ id: 'f3', number: 12, title: 'Kecepatan & Keandalan Sistem', desc: 'Akses video modul materi lancar tanpa kendala buffering atau pemutaran.' },
		{ id: 'f4', number: 13, title: 'Kejelasan Petunjuk Evaluasi', desc: 'Instruksi dan panduan pengerjaan kuis, pre-test, dan evaluasi mudah dipahami.' },
		{ id: 'f5', number: 14, title: 'Kenyamanan Pembelajaran Mandiri', desc: 'Fasilitas pembelajaran mandiri fleksibel dan mendukung ritme kerja lapangan.' },
		{ id: 'f6', number: 15, title: 'Dukungan Panduan Teknis', desc: 'Panduan teknis dan sistem bantuan terstandarisasi bagi peserta.' }
	];

	const ratingScaleLabels = [
		{ score: 1, label: 'Sangat Kurang', short: 'SK' },
		{ score: 2, label: 'Kurang', short: 'K' },
		{ score: 3, label: 'Cukup', short: 'C' },
		{ score: 4, label: 'Baik', short: 'B' },
		{ score: 5, label: 'Sangat Baik', short: 'SB' }
	];

	const allLikertKeys = ['m1', 'm2', 'm3', 'm4', 'm5', 'i1', 'i2', 'i3', 'i4', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6'];

	let answeredLikertCount = $derived(
		allLikertKeys.filter(k => evalLikert[k] !== undefined && evalLikert[k] >= 1 && evalLikert[k] <= 5).length
	);

	let answeredEssayCount = $derived(
		(appliedBenefit.trim().length > 0 ? 1 : 0) +
		(impressions.trim().length > 0 ? 1 : 0) +
		(suggestions.trim().length > 0 ? 1 : 0)
	);

	let totalAnsweredCount = $derived(answeredLikertCount + answeredEssayCount);
	let isEvaluationComplete = $derived(
		answeredLikertCount === 15 && 
		appliedBenefit.trim().length > 0 && 
		impressions.trim().length > 0 && 
		suggestions.trim().length > 0
	);
	let completionPercent = $derived(Math.round((totalAnsweredCount / 18) * 100));

	function setAllLikertScore(val: number) {
		allLikertKeys.forEach(k => {
			evalLikert[k] = val;
		});
	}

	function resetEssays() {
		appliedBenefit = '';
		impressions = '';
		suggestions = '';
	}

	// Sertifikat Aktif
	let activeCert = $state(data.certificate || null);

	// State Popup Komparasi Nilai & Kunci Jawaban Post-Test
	let showComparisonModal = $state(false);
	let isPostTestSubmitted = $state(data.enrollment?.postTestScore !== null);

	// State Percobaan Post-Test & Status Evaluasi
	let attemptsCount = $derived(
		form?.actionType === 'POST_TEST' && typeof form.postTestAttempts === 'number'
			? form.postTestAttempts
			: (data.postTestAttempts ?? data.enrollment?.postTestAttempts ?? 0)
	);
	let isRetryingPostTest = $state(false);
	let isEvaluationSubmitted = $derived(
		form?.actionType === 'EVALUATION_L1' && form?.success
			? true
			: Boolean(data.isEvaluationSubmitted)
	);
	let hasEssayPending = $derived(
		form?.actionType === 'POST_TEST' && typeof form.hasEssayPending === 'boolean'
			? form.hasEssayPending
			: Boolean(data.enrollment?.hasEssayPending)
	);
	let isCompletedFinal = $derived(
		Boolean(data.isCompletedFinal) || Boolean(activeCert) || (isEvaluationSubmitted && !hasEssayPending) || data.enrollment?.status === 'COMPLETED'
	);

	let preScoreVal = $derived(
		form?.actionType === 'POST_TEST' && typeof form.preTestScore === 'number'
			? form.preTestScore
			: (data.enrollment?.preTestScore ?? 0)
	);

	let postScoreVal = $derived(
		form?.actionType === 'POST_TEST' && typeof form.score === 'number'
			? form.score
			: (data.enrollment?.postTestScore ?? 0)
	);

	let coursePassingGrade = $derived(
		form?.actionType === 'POST_TEST' && typeof form.passingGrade === 'number'
			? form.passingGrade
			: (course?.passingGrade ?? 75)
	);

	let isTestPassed = $derived(
		form?.actionType === 'POST_TEST' && typeof form.isPassed === 'boolean'
			? form.isPassed
			: (!hasEssayPending && postScoreVal >= coursePassingGrade)
	);

	let scoreDelta = $derived(postScoreVal - preScoreVal);

	let hasActiveCertificate = $derived(
		form?.actionType === 'POST_TEST' && typeof form.hasActiveCert === 'boolean'
			? form.hasActiveCert
			: Boolean(data.hasActiveCertificate || (activeCert?.validUntil && new Date(activeCert.validUntil).getTime() > Date.now()))
	);

	// Sinkronisasi step berdasarkan kembalian server action
	$effect(() => {
		if (form) {
			if (form.actionType === 'POST_TEST') {
				showComparisonModal = true;
				isPostTestSubmitted = true;
				isRetryingPostTest = false;
				if (form.postTestAnswers) {
					postAnswers = { ...postAnswers, ...form.postTestAnswers };
				}
				if (form.hasActiveCert && activeCert) {
					activeCert.score = Math.max(Number(activeCert.score) || 0, form.score);
				}
			} else if (form.actionType === 'PRE_TEST') {
				if (form.preTestAnswers) {
					preAnswers = { ...preAnswers, ...form.preTestAnswers };
				}
				if (form.step) {
					currentStep = form.step as 1 | 2 | 3 | 4 | 5;
				}
			} else if (form.success) {
				if (form.step) {
					currentStep = form.step as 1 | 2 | 3 | 4 | 5;
				}
				if (form.certificate) {
					activeCert = form.certificate;
				}
			}
		}
	});

	// Helper Navigasi Modul
	function nextModule() {
		if (activeModuleIndex < course.modules.length - 1) {
			activeModuleIndex += 1;
		} else {
			currentStep = 3; // Modul tuntas -> lanjut ke Post-Test
		}
	}

	function prevModule() {
		if (activeModuleIndex > 0) {
			activeModuleIndex -= 1;
		}
	}
</script>

<svelte:head>
	<title>{course.title} | Player Pembelajaran BCS Academy</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-6 pb-12">
	<!-- TOP BAR & BACK BUTTON -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
		<a 
			href="/" 
			class="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors self-start"
		>
			<span class="material-symbols-outlined text-lg">arrow_back</span>
			<span>Kembali ke Katalog Kursus</span>
		</a>

		<div class="flex items-center gap-2 self-start sm:self-auto">
			<span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800/50">
				{course.category}
			</span>
			<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
				Passing Grade: 75%
			</span>
		</div>
	</div>

	{#if data.isLocked}
		<!-- ════════════════════════════════════════════════════════════════════════ -->
		<!-- TAMPILAN TERKUNCI: MENUNGGU JADWAL / COUNTDOWN JADWAL                    -->
		<!-- ════════════════════════════════════════════════════════════════════════ -->
		<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-xl text-center space-y-6">
			<div class="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800 flex items-center justify-center mx-auto shadow-inner">
				<span class="material-symbols-outlined text-4xl">
					{data.schedule?.hasSchedule ? 'schedule' : 'hourglass_empty'}
				</span>
			</div>

			<div class="max-w-lg mx-auto space-y-3">
				<span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider {data.schedule?.hasSchedule ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}">
					{data.schedule?.hasSchedule ? 'Jadwal Pelatihan Ditetapkan' : 'Menunggu Jadwal Pelatihan'}
				</span>

				<h2 class="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
					{#if data.schedule?.hasSchedule}
						Pelatihan Dimulai Dalam: <br/>
						<span class="text-amber-600 dark:text-amber-400 font-mono mt-1 inline-block">{data.schedule.countdownText}</span>
					{:else}
						Menunggu Jadwal Pelatihan Resmi
					{/if}
				</h2>

				<p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
					{#if data.schedule?.hasSchedule}
						Sesi pembelajaran untuk <strong>{course.title}</strong> dijadwalkan pada <strong>{data.schedule.formattedDate}</strong> ({data.schedule.sessionType}) bersama <strong>{data.schedule.trainer}</strong>. Akses modul pembelajaran dan ujian akan terbuka otomatis begitu jadwal pelatihan dimulai.
					{:else}
						Anda telah terdaftar pada pelatihan <strong>{course.title}</strong>. Saat ini modul belum dapat diakses karena masih menunggu penetapan jadwal sesi resmi dari Tim Human Capital / Training & Development PT BCS.
					{/if}
				</p>
			</div>

			{#if data.schedule?.hasSchedule}
				<div class="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-left grid grid-cols-2 gap-3">
					<div>
						<span class="text-[10px] uppercase font-bold text-slate-400">Tanggal Pelatihan</span>
						<p class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{data.schedule.sessionDate}</p>
					</div>
					<div>
						<span class="text-[10px] uppercase font-bold text-slate-400">Jam Mulai</span>
						<p class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{data.schedule.startTime} WIB</p>
					</div>
					<div>
						<span class="text-[10px] uppercase font-bold text-slate-400">Metode Sesi</span>
						<p class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{data.schedule.sessionType}</p>
					</div>
					<div>
						<span class="text-[10px] uppercase font-bold text-slate-400">Instruktur</span>
						<p class="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{data.schedule.trainer}</p>
					</div>
				</div>
			{/if}

			<div class="pt-2 flex items-center justify-center gap-3">
				<a 
					href="/" 
					class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
				>
					<span class="material-symbols-outlined text-sm">home</span>
					<span>Kembali ke Beranda</span>
				</a>
				<a 
					href="/catalog" 
					class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm"
				>
					<span class="material-symbols-outlined text-sm">menu_book</span>
					<span>Lihat Katalog Lainnya</span>
				</a>
			</div>
		</div>
	{:else}
		<!-- ════════════════════════════════════════════════════════════════════════ -->
		<!-- STEPPER HEADER 5 TAHAP                                                   -->
		<!-- ════════════════════════════════════════════════════════════════════════ -->
		<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
			<div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
				<!-- Step 1: Pre-Test -->
				<button
					type="button"
					disabled={isCompletedFinal || data.enrollment?.preTestScore !== null}
					onclick={() => { if (!isCompletedFinal && data.enrollment?.preTestScore === null && currentStep > 1) currentStep = 1; }}
					class="flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all {currentStep === 1 ? 'bg-indigo-600 text-white shadow-md font-black' : (data.enrollment?.preTestScore !== null || currentStep > 1) ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' : 'text-slate-400 opacity-60'} {(isCompletedFinal || data.enrollment?.preTestScore !== null) ? 'cursor-default' : 'cursor-pointer'}"
					title={data.enrollment?.preTestScore !== null ? `Pre-Test Selesai (${data.enrollment.preTestScore}/100) - Tidak dapat diulang` : 'Tahap 1: Pre-Test'}
				>
					<span class="material-symbols-outlined text-xl {data.enrollment?.preTestScore !== null || currentStep > 1 ? 'text-emerald-600 dark:text-emerald-400' : ''}">
						{data.enrollment?.preTestScore !== null || currentStep > 1 ? 'check_circle' : 'assignment'}
					</span>
					<div class="min-w-0">
						<p class="text-[10px] uppercase font-bold tracking-wider opacity-80">Tahap 1</p>
						<p class="text-xs truncate font-bold">Pre-Test</p>
					</div>
				</button>

				<!-- Step 2: Modul Materi (Bebas dibuka kapan saja) -->
				<button
					type="button"
					onclick={() => (currentStep = 2)}
					class="flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all cursor-pointer {currentStep === 2 ? 'bg-indigo-600 text-white shadow-md font-black' : currentStep > 2 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}"
					title="Tahap 2: Modul Pembelajaran (Dapat dibuka & ditinjau kapan saja)"
				>
					<span class="material-symbols-outlined text-xl {currentStep > 2 ? 'text-emerald-600 dark:text-emerald-400' : ''}">
						{currentStep > 2 ? 'check_circle' : 'play_lesson'}
					</span>
					<div class="min-w-0">
						<p class="text-[10px] uppercase font-bold tracking-wider opacity-80">Tahap 2</p>
						<p class="text-xs truncate font-bold">Modul Materi</p>
					</div>
				</button>

				<!-- Step 3: Post-Test (Terkunci jika isCompletedFinal) -->
				<button
					type="button"
					disabled={isCompletedFinal}
					onclick={() => { if (!isCompletedFinal && (currentStep >= 3 || (data.enrollment?.completedModulesCount || 0) >= course.modules.length)) currentStep = 3; }}
					class="flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all {currentStep === 3 ? 'bg-indigo-600 text-white shadow-md font-black' : currentStep > 3 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' : 'text-slate-400 opacity-60'} {isCompletedFinal ? 'cursor-default' : 'cursor-pointer'}"
					title={isCompletedFinal ? 'Pelatihan telah selesai - Post-test terkunci' : 'Tahap 3: Post-Test'}
				>
					<span class="material-symbols-outlined text-xl {currentStep > 3 ? 'text-emerald-600 dark:text-emerald-400' : ''}">
						{currentStep > 3 ? 'check_circle' : 'quiz'}
					</span>
					<div class="min-w-0">
						<p class="text-[10px] uppercase font-bold tracking-wider opacity-80">Tahap 3</p>
						<p class="text-xs truncate font-bold">Post-Test</p>
					</div>
				</button>

				<!-- Step 4: Evaluasi L1 (Terkunci jika isCompletedFinal / isEvaluationSubmitted) -->
				<button
					type="button"
					disabled={isCompletedFinal || isEvaluationSubmitted}
					onclick={() => { if (!isCompletedFinal && !isEvaluationSubmitted && currentStep >= 4) currentStep = 4; }}
					class="flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all {currentStep === 4 ? 'bg-indigo-600 text-white shadow-md font-black' : (isEvaluationSubmitted || currentStep > 4) ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' : 'text-slate-400 opacity-60'} {(isCompletedFinal || isEvaluationSubmitted) ? 'cursor-default' : 'cursor-pointer'}"
					title={isEvaluationSubmitted ? 'Evaluasi telah dikirim - Formulir terkunci' : 'Tahap 4: Evaluasi Kirkpatrick Level 1'}
				>
					<span class="material-symbols-outlined text-xl {isEvaluationSubmitted || currentStep > 4 ? 'text-emerald-600 dark:text-emerald-400' : ''}">
						{isEvaluationSubmitted || currentStep > 4 ? 'check_circle' : 'rate_review'}
					</span>
					<div class="min-w-0">
						<p class="text-[10px] uppercase font-bold tracking-wider opacity-80">Tahap 4</p>
						<p class="text-xs truncate font-bold">Evaluasi L1</p>
					</div>
				</button>

				<!-- Step 5: E-Sertifikat -->
				<button
					type="button"
					onclick={() => { if (currentStep === 5 || activeCert || isCompletedFinal) currentStep = 5; }}
					class="col-span-2 sm:col-span-1 flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all cursor-pointer {currentStep === 5 ? 'bg-emerald-600 text-white shadow-md font-black' : (activeCert || isCompletedFinal) ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' : 'text-slate-400 opacity-60'}"
					title="Tahap 5: E-Sertifikat Kelulusan"
				>
					<span class="material-symbols-outlined text-xl">
						{activeCert || isCompletedFinal ? 'verified' : 'workspace_premium'}
					</span>
					<div class="min-w-0">
						<p class="text-[10px] uppercase font-bold tracking-wider opacity-80">Tahap 5</p>
						<p class="text-xs truncate font-bold">E-Sertifikat</p>
					</div>
				</button>
			</div>
		</div>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<!-- TAHAP 1: PRE-TEST (UJI BASELINE PEMAHAMAN AWAL)                          -->
	<!-- ════════════════════════════════════════════════════════════════════════ -->
	{#if currentStep === 1}
		<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
			<!-- Banner Info Pre-Test -->
			<div class="p-5 rounded-2xl bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 space-y-2">
				<div class="flex items-center gap-2">
					<span class="material-symbols-outlined text-blue-500 text-2xl">assignment</span>
					<h3 class="font-black text-base text-slate-900 dark:text-white">Tahap 1: Uji Pemahaman Awal (Pre-Test)</h3>
					<span class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
						Wajib Diisi
					</span>
				</div>
				<p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
					Pre-test ini bertujuan mengukur pemahaman awal (baseline) Anda sebelum mempelajari materi kursus <strong>{course.title}</strong>. Tidak ada batasan nilai minimal kelulusan pada tahap ini. Setelah mengirimkan jawaban, materi modul akan langsung terbuka secara otomatis.
				</p>
			</div>

			<!-- Status jika sudah pernah submit -->
			{#if data.enrollment?.preTestScore !== null}
				<div class="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<span class="material-symbols-outlined text-3xl text-emerald-600 dark:text-emerald-400 shrink-0">check_circle</span>
						<div>
							<p class="text-sm font-bold text-emerald-900 dark:text-emerald-200">Pre-Test Telah Selesai Dikerjakan</p>
							<p class="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Nilai baseline pemahaman awal Anda tercatat: <strong>{data.enrollment.preTestScore}/100</strong>. Pre-test hanya dapat dikerjakan 1 kali dan tidak dapat diulang.</p>
						</div>
					</div>
					<button
						type="button"
						onclick={() => (currentStep = 2)}
						class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
					>
						<span>Lanjut ke Modul Materi</span>
						<span class="material-symbols-outlined text-sm">arrow_forward</span>
					</button>
				</div>
			{:else}
				<!-- Form Soal-Soal Pre-Test -->
				<form
					method="POST"
					action="?/submitPreTest"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update();
							isSubmitting = false;
						};
					}}
					class="space-y-6"
				>
					<div class="space-y-5">
						{#each preTestQuestions as q, idx}
							{@const isEssay = q.questionType === 'ESSAY' || !q.options || q.options.length === 0}
							{@const ansText = preAnswers[q.id] || ''}
							<div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
								<div class="flex items-start justify-between gap-3">
									<div class="flex items-start gap-3">
										<span class="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">
											{idx + 1}
										</span>
										<p class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
											{q.questionText}
										</p>
									</div>
									<span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 {isEssay ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'}">
										{isEssay ? 'Uraian / Essay' : 'Pilihan Ganda'}
									</span>
								</div>

								{#if isEssay}
									<div class="space-y-2 pl-9">
										<textarea
											name="pre_{q.id}"
											bind:value={preAnswers[q.id]}
											rows="4"
											minlength="10"
											required
											placeholder="Tuliskan jawaban uraian Anda di sini secara lengkap (minimal 10 karakter)..."
											class="w-full p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-all outline-none resize-y min-h-[100px]"
										></textarea>
										<div class="flex items-center justify-between text-[11px] text-slate-400">
											<span class="flex items-center gap-1">
												<span class="material-symbols-outlined text-xs text-amber-500">info</span>
												Jawaban tersimpan untuk evaluasi baseline pemahaman Anda.
											</span>
											<span class="font-medium {ansText.trim().length < 10 ? 'text-amber-500' : 'text-emerald-500'}">
												{ansText.trim().length} / min. 10 karakter
											</span>
										</div>
									</div>
								{:else}
									<div class="space-y-2 pl-9">
										{#each q.options as opt}
											<label class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer">
												<input
													type="radio"
													name="pre_{q.id}"
													value={opt.key}
													bind:group={preAnswers[q.id]}
													required
													class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
												/>
												<span class="text-xs text-slate-800 dark:text-slate-200 font-medium">
													<strong class="font-bold text-indigo-600 dark:text-indigo-400">{opt.key}.</strong> {opt.text}
												</span>
											</label>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>

					<div class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
						<p class="text-xs text-slate-400">Total {preTestQuestions.length} Pertanyaan Baseline</p>
						<button
							type="submit"
							disabled={isSubmitting}
							class="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
						>
							<span>{isSubmitting ? 'Mengirim Jawaban...' : 'Kirim Jawaban Pre-Test & Buka Modul'}</span>
							<span class="material-symbols-outlined text-sm">arrow_forward</span>
						</button>
					</div>
				</form>
			{/if}
		</div>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<!-- TAHAP 2: MODUL MATERI PEMBELAJARAN (VIDEO & DOKUMEN)                     -->
	<!-- ════════════════════════════════════════════════════════════════════════ -->
	{:else if currentStep === 2}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Canvas Pemutar Video / Dokumen -->
			<div class="lg:col-span-2 space-y-4">
				<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col">
					<!-- Player Header & Media Viewer -->
					<div bind:this={playerViewerRef} class="bg-slate-900 text-white p-5 md:p-6 space-y-4 {isFullscreen ? 'fixed inset-0 z-50 p-6 flex flex-col justify-between rounded-none overflow-y-auto bg-slate-950' : ''}">
						<!-- Bar Info Modul Aktif -->
						<div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
							<div class="flex items-center gap-2">
								{#if isCurrentModulePdf}
									<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
										<span class="material-symbols-outlined text-xs">picture_as_pdf</span>
										<span>PDF</span>
									</span>
								{:else}
									<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
										<span class="material-symbols-outlined text-xs">smart_display</span>
										<span>VIDEO</span>
									</span>
								{/if}

								{#if currentModule.contentUrl}
									{@const platform = detectEmbedPlatform(currentModule.contentUrl)}
									<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
										<span class="material-symbols-outlined text-xs">{platform.icon}</span>
										<span>{platform.name}</span>
									</span>
								{/if}
							</div>

							<div class="flex items-center gap-3">
								{#if !isCurrentModulePdf}
									<span class="text-xs text-slate-400 font-medium">Durasi: {currentModule.durationText || '15 Menit'}</span>
								{/if}

								<!-- Tombol Fullscreen (Layar Penuh) -->
								<button
									type="button"
									onclick={toggleFullscreen}
									class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer shadow-xs"
									title={isFullscreen ? 'Keluar Layar Penuh (Esc)' : 'Tampilkan Layar Penuh'}
								>
									<span class="material-symbols-outlined text-sm">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
									<span>{isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}</span>
								</button>
							</div>
						</div>

						<!-- Media Canvas: Iframe / Document Viewer / Video Box -->
						{#if currentModule.contentUrl}
							{@const embedSrc = formatEmbedUrl(currentModule.contentUrl)}
							<div class="space-y-4 {isFullscreen ? 'flex-1 flex flex-col' : ''}">
								<div class="w-full {isFullscreen ? 'flex-1 min-h-[75vh]' : 'h-80 sm:h-96 md:h-[460px]'} rounded-2xl overflow-hidden bg-black/60 border border-slate-800 shadow-inner">
									<iframe
										src={embedSrc}
										title={currentModule.title}
										class="w-full h-full border-0"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
										allowfullscreen
									></iframe>
								</div>

								{#if currentModule.contentBody}
									<div class="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap space-y-1.5">
										<div class="flex items-center gap-1.5 text-indigo-400 font-bold">
											<span class="material-symbols-outlined text-sm">notes</span>
											<span>Catatan & Ringkasan Materi</span>
										</div>
										<p class="text-slate-300 pl-5">{currentModule.contentBody}</p>
									</div>
								{/if}
							</div>
						{:else if currentModule.type === 'DOCUMENT'}
							<div class="p-6 md:p-8 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
								<div class="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
									<span class="material-symbols-outlined text-base">description</span>
									<span>Dokumen Standar Operasional Prosedur (SOP)</span>
								</div>
								<div class="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
									{currentModule.contentBody || 'Dokumen materi dan panduan standar operasional.'}
								</div>
							</div>
						{:else if currentModule.type === 'QUIZ'}
							<div class="p-8 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-800/50 space-y-4 text-center">
								<div class="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/20">
									<span class="material-symbols-outlined text-3xl">quiz</span>
								</div>
								<div>
									<h4 class="font-black text-base text-white">{currentModule.title}</h4>
									<p class="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
										{currentModule.contentBody || 'Modul ini merupakan bagian evaluasi kelulusan. Selesaikan materi modul untuk memulai ujian Post-Test.'}
									</p>
								</div>
								<button
									type="button"
									onclick={() => (currentStep = 3)}
									class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
								>
									<span>Lanjut ke Post-Test Kelulusan</span>
									<span class="material-symbols-outlined text-xs">arrow_forward</span>
								</button>
							</div>
						{:else}
							<div class="w-full h-80 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden">
								<div class="w-16 h-16 rounded-3xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse">
									<span class="material-symbols-outlined text-3xl">play_circle</span>
								</div>
								<h4 class="font-black text-sm md:text-base text-white max-w-md">
									{currentModule.title}
								</h4>
								<p class="text-xs text-slate-400">
									Bab {activeModuleIndex + 1} dari {course.modules.length} • Durasi: {currentModule.durationText} • Format: {currentModule.type}
								</p>
								{#if currentModule.contentBody}
									<p class="text-xs text-slate-300 max-w-md mt-2 whitespace-pre-wrap">{currentModule.contentBody}</p>
								{/if}
							</div>
						{/if}

						<!-- Controls Navigasi Bab & Trainer -->
						<div class="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div class="flex items-center gap-2 text-xs text-slate-400">
								<span class="material-symbols-outlined text-sm text-indigo-400">person</span>
								<span>Instruktur: <strong>{course.instructor}</strong></span>
							</div>

							<div class="flex items-center gap-2">
								<button
									type="button"
									disabled={activeModuleIndex === 0}
									onclick={prevModule}
									class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1"
								>
									<span class="material-symbols-outlined text-xs">arrow_back</span>
									<span>Bab Sebelumnya</span>
								</button>

								<form
									method="POST"
									action="?/updateModuleProgress"
									use:enhance={() => {
										return async ({ update }) => {
											await update();
											nextModule();
										};
									}}
								>
									<input type="hidden" name="moduleIndex" value={activeModuleIndex} />
									<input type="hidden" name="totalModules" value={course.modules.length} />

									<button
										type="submit"
										class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
									>
										<span>{activeModuleIndex < course.modules.length - 1 ? 'Selesai & Lanjut Bab' : 'Selesaikan Seluruh Materi'}</span>
										<span class="material-symbols-outlined text-xs">arrow_forward</span>
									</button>
								</form>
							</div>
						</div>
					</div>

					<!-- Ringkasan Info Kursus -->
					<div class="p-6 space-y-2 border-t border-slate-100 dark:border-slate-800">
						<h2 class="text-lg font-black text-slate-900 dark:text-white">{course.title}</h2>
						<p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{course.description}</p>
					</div>
				</div>
			</div>

			<!-- Silabus Bab Pembelajaran -->
			<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 h-fit">
				<div>
					<h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Silabus Bab Pelatihan</h3>
					<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{course.modules.length} Bab • Total {course.durationHours} Jam</p>
				</div>

				<div class="space-y-2">
					{#each course.modules as mod, i}
						{@const isSelected = activeModuleIndex === i}
						<button
							type="button"
							onclick={() => (activeModuleIndex = i)}
							class="w-full text-left p-3.5 rounded-2xl transition-all flex items-center gap-3 cursor-pointer {isSelected ? 'bg-indigo-600 text-white shadow-md font-bold' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-transparent'}"
						>
							<div class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black {isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}">
								{i + 1}
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-xs truncate">{mod.title}</p>
								{#if isModulePdf(mod)}
									<p class="text-[10px] {isSelected ? 'text-white/80' : 'text-rose-500 dark:text-rose-400 font-semibold'} mt-0.5">Dokumen PDF</p>
								{:else}
									<p class="text-[10px] opacity-70 mt-0.5">{mod.durationText} • VIDEO</p>
								{/if}
							</div>
							<span class="material-symbols-outlined text-base {isSelected ? 'text-white' : 'text-slate-300'}">
								{isSelected ? 'play_arrow' : 'radio_button_unchecked'}
							</span>
						</button>
					{/each}
				</div>

				<div class="pt-3 border-t border-slate-100 dark:border-slate-800">
					<button
						type="button"
						onclick={() => (currentStep = 3)}
						class="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
					>
						<span>Lanjut ke Post-Test &rarr;</span>
					</button>
				</div>
			</div>
		</div>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<!-- TAHAP 3: POST-TEST (EVALUASI KELULUSAN KURSUS)                           -->
	<!-- ════════════════════════════════════════════════════════════════════════ -->
	{:else if currentStep === 3}
		<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
			<div class="p-5 rounded-2xl bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/20 space-y-2">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="material-symbols-outlined text-amber-500 text-2xl">quiz</span>
						<h3 class="font-black text-base text-slate-900 dark:text-white">Tahap 3: Ujian Evaluasi Kelulusan (Post-Test)</h3>
					</div>
					<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
						Passing Grade {coursePassingGrade}%
					</span>
				</div>
				<p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
					Buktikan pemahaman Anda setelah mempelajari materi. Dapatkan nilai minimal <strong>{coursePassingGrade}/100</strong> untuk dinyatakan lulus dan melanjutkan ke penerbitan sertifikat digital resmi.
				</p>
			</div>

			<!-- Indikator Percobaan Post-Test & Status Terkunci -->
			{#if attemptsCount >= 2}
				<div class="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800/60 space-y-3">
					<div class="flex items-start justify-between gap-3">
						<div class="flex items-center gap-3">
							<span class="material-symbols-outlined text-rose-600 dark:text-rose-400 text-3xl shrink-0">lock</span>
							<div>
								<h4 class="font-bold text-sm text-slate-900 dark:text-white">Post-Test Terkunci Permanen</h4>
								<p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
									Anda telah menggunakan batas maksimal <strong>2 kali kesempatan</strong> pengerjaan Post-Test. Nilai akhir tertinggi Anda: <strong>{postScoreVal}/100</strong>. Anda tidak dapat mengulang tes ini lagi.
								</p>
							</div>
						</div>
						<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 shrink-0">
							2 dari 2 Percobaan
						</span>
					</div>

					<div class="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-rose-200 dark:border-rose-900/60">
						<button
							type="button"
							onclick={() => (currentStep = 2)}
							class="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
						>
							<span class="material-symbols-outlined text-sm">menu_book</span>
							<span>Lihat Materi Modul</span>
						</button>
						<div class="flex items-center gap-2">
							<button
								type="button"
								onclick={() => (showComparisonModal = true)}
								class="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
							>
								<span class="material-symbols-outlined text-sm">analytics</span>
								<span>Hasil Komparasi</span>
							</button>
							<button
								type="button"
								onclick={() => (currentStep = 4)}
								class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow"
							>
								<span>Lanjut ke Evaluasi &rarr;</span>
							</button>
						</div>
					</div>
				</div>
			{:else if attemptsCount === 1 && !isRetryingPostTest}
				<div class="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 space-y-3">
					<div class="flex items-start justify-between gap-3">
						<div class="flex items-center gap-3">
							<span class="material-symbols-outlined text-amber-600 text-3xl shrink-0">history_edu</span>
							<div>
								<h4 class="font-bold text-sm text-slate-900 dark:text-white">Hasil Percobaan Pertama: {postScoreVal}/100</h4>
								<p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
									{isTestPassed ? 'Selamat, Anda telah melampaui Passing Grade.' : 'Nilai belum mencapai Passing Grade (75).'}
									Anda masih memiliki <strong>1 kali kesempatan remedial</strong> jika ingin memperbaiki nilai. Anda juga dapat membaca kembali materi di Bab Belajar sebelum mengulang.
								</p>
							</div>
						</div>
						<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 shrink-0">
							Percobaan 1 dari 2
						</span>
					</div>

					<div class="pt-2 flex flex-wrap items-center gap-2 border-t border-amber-200 dark:border-amber-900/60">
						<button
							type="button"
							onclick={() => (currentStep = 2)}
							class="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
						>
							<span class="material-symbols-outlined text-sm">menu_book</span>
							<span>Tinjau & Pelajari Lagi Materi</span>
						</button>
						<button
							type="button"
							onclick={() => {
								isRetryingPostTest = true;
								postAnswers = {};
							}}
							class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow"
						>
							<span class="material-symbols-outlined text-sm">refresh</span>
							<span>Ulangi Post-Test Sekarang (Sisa 1x)</span>
						</button>
						<button
							type="button"
							onclick={() => (currentStep = 4)}
							class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow ml-auto"
						>
							<span>Lanjut ke Evaluasi &rarr;</span>
						</button>
					</div>
				</div>
			{/if}

			{#if attemptsCount === 0 || isRetryingPostTest}
				{#if isRetryingPostTest}
					<div class="p-3.5 rounded-xl bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-base">warning</span>
							<span>Percobaan 2 dari 2: Ini adalah kesempatan terakhir Anda mengerjakan Post-Test.</span>
						</div>
						<button
							type="button"
							onclick={() => (isRetryingPostTest = false)}
							class="text-[11px] underline cursor-pointer"
						>
							Batalkan & Kembali
						</button>
					</div>
				{/if}

				<!-- Form Soal-Soal Post-Test -->
				<form
					method="POST"
					action="?/submitPostTest"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update();
							isSubmitting = false;
						};
					}}
					class="space-y-6"
				>
					<div class="space-y-5">
						{#each postTestQuestions as q, idx}
							{@const isEssay = q.questionType === 'ESSAY' || !q.options || q.options.length === 0}
							{@const ansText = postAnswers[q.id] || ''}
							<div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
								<div class="flex items-start justify-between gap-3">
									<div class="flex items-start gap-3">
										<span class="w-6 h-6 rounded-lg bg-amber-600 text-white text-xs font-black flex items-center justify-center shrink-0">
											{idx + 1}
										</span>
										<p class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
											{q.questionText}
										</p>
									</div>
									<span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 {isEssay ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800'}">
										{isEssay ? 'Uraian / Essay' : 'Pilihan Ganda'}
									</span>
								</div>

								{#if isEssay}
									<div class="space-y-2 pl-9">
										<textarea
											name="post_{q.id}"
											bind:value={postAnswers[q.id]}
											disabled={isSubmitting}
											rows="4"
											minlength="10"
											required
											placeholder="Tuliskan jawaban evaluasi uraian Anda di sini secara lengkap (minimal 10 karakter)..."
											class="w-full p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-all outline-none resize-y min-h-[100px] disabled:opacity-50"
										></textarea>
										<div class="flex items-center justify-between text-[11px] text-slate-400">
											<span class="flex items-center gap-1">
												<span class="material-symbols-outlined text-xs text-amber-500">rate_review</span>
												Jawaban essay akan dinilai langsung oleh instruktur / trainer.
											</span>
											<span class="font-medium {ansText.trim().length < 10 ? 'text-amber-500' : 'text-emerald-500'}">
												{ansText.trim().length} / min. 10 karakter
											</span>
										</div>
									</div>
								{:else}
									<div class="space-y-2 pl-9">
										{#each q.options as opt}
											<label class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer">
												<input
													type="radio"
													name="post_{q.id}"
													value={opt.key}
													bind:group={postAnswers[q.id]}
													disabled={isSubmitting}
													required
													class="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
												/>
												<span class="text-xs text-slate-800 dark:text-slate-200 font-medium">
													<strong class="font-bold text-amber-600 dark:text-amber-400">{opt.key}.</strong> {opt.text}
												</span>
											</label>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>

					<div class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
						<button
							type="button"
							onclick={() => (currentStep = 2)}
							class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
						>
							&larr; Kembali ke Materi
						</button>

						<button
							type="submit"
							disabled={isSubmitting}
							class="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs shadow-lg shadow-amber-600/30 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
						>
							<span>{isSubmitting ? 'Memeriksa Jawaban...' : (isRetryingPostTest ? 'Kirim Jawaban Remedial (Percobaan 2)' : 'Kirim Jawaban Post-Test (Percobaan 1)')}</span>
							<span class="material-symbols-outlined text-sm">verified</span>
						</button>
					</div>
				</form>
			{/if}
		</div>

		<!-- POP-UP / MODAL KOMPARASI HASIL PRE-TEST VS POST-TEST -->
		{#if showComparisonModal}
			<div
				class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
				role="dialog"
				aria-modal="true"
			>
				<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 relative">
					<!-- Close button top-right -->
					<button
						type="button"
						onclick={() => (showComparisonModal = false)}
						class="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
						aria-label="Tutup Modal"
					>
						<span class="material-symbols-outlined text-xl">close</span>
					</button>

					<!-- Header -->
					<div class="text-center space-y-2 pt-2">
						<div class="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-500 dark:text-amber-400 mb-1">
							<span class="material-symbols-outlined text-3xl">insights</span>
						</div>
						<h3 class="text-lg md:text-xl font-black text-slate-900 dark:text-white">
							Hasil Evaluasi Pembelajaran
						</h3>
						<p class="text-xs text-slate-500 dark:text-slate-400">
							Komparasi Skor Awal (Pre-Test) vs Capaian Akhir (Post-Test)
						</p>
					</div>

					<!-- Komparasi Nilai 2 Kolom -->
					<div class="grid grid-cols-2 gap-3 md:gap-4">
						<!-- Pre-Test Card -->
						<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center space-y-1">
							<span class="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
								Pre-Test (Awal)
							</span>
							<div class="text-3xl md:text-4xl font-black text-slate-700 dark:text-slate-300">
								{preScoreVal}
							</div>
							<div class="text-[10px] font-semibold text-slate-400">Skor Baseline</div>
						</div>

						<!-- Post-Test Card -->
						<div class="p-4 rounded-2xl {isTestPassed ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'} border text-center space-y-1">
							<span class="text-[10px] font-black uppercase tracking-wider {isTestPassed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}">
								Post-Test (Akhir)
							</span>
							<div class="text-3xl md:text-4xl font-black {isTestPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
								{postScoreVal}
							</div>
							<div class="text-[10px] font-bold {isTestPassed ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-rose-600/80 dark:text-rose-400/80'}">
								Standar Kelulusan: {coursePassingGrade}
							</div>
						</div>
					</div>

					<!-- Delta Pertumbuhan / Learning Gain -->
					<div class="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 flex items-center justify-between text-xs">
						<span class="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
							<span class="material-symbols-outlined text-base text-slate-400">trending_up</span>
							Pertumbuhan Belajar (Gain):
						</span>
						<span class="font-black px-2.5 py-1 rounded-lg {scoreDelta > 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : scoreDelta === 0 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}">
							{scoreDelta > 0 ? `+${scoreDelta} Poin` : `${scoreDelta} Poin`}
						</span>
					</div>

					<!-- Status Kelulusan Murni / Apa Adanya / Review Essay -->
					{#if hasEssayPending}
						<div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex items-start gap-3">
							<span class="material-symbols-outlined text-2xl text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">hourglass_top</span>
							<div class="space-y-1 text-xs">
								<div class="font-black text-amber-900 dark:text-amber-200">
									JAWABAN SOAL ESSAY MENUNGGU PENILAIAN INSTRUKTUR
								</div>
								<p class="text-amber-700 dark:text-amber-300 leading-relaxed text-[11px]">
									Jawaban uraian Anda telah tersimpan dengan aman di database. Nilai pilihan ganda sementara: <strong>{postScoreVal}/100</strong>. Nilai akhir kelulusan dan e-sertifikat akan diproses setelah instruktur/HR selesai meninjau uraian Anda. Silakan lanjut ke pengisian Formulir Evaluasi Pelatihan (Step 4).
								</p>
							</div>
						</div>
					{:else if isTestPassed}
						<div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
							<span class="material-symbols-outlined text-2xl text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">verified</span>
							<div class="space-y-1 text-xs">
								<div class="font-black text-emerald-900 dark:text-emerald-200">
									SELAMAT, ANDA DINYATAKAN LULUS!
								</div>
								<p class="text-emerald-700 dark:text-emerald-300 leading-relaxed text-[11px]">
									{#if hasActiveCertificate}
										Nilai Post-Test Anda ({postScoreVal}) melampaui Passing Grade ({coursePassingGrade}). E-Sertifikat resmi Anda (#{activeCert?.certificateNumber || form?.activeCertNumber || 'AKTIF'}) tetap berlaku aktif hingga {activeCert?.validUntil || '1 Tahun'} dan nilai tertingginya telah diperbarui.
									{:else}
										Nilai Post-Test Anda ({postScoreVal}) melampaui batas minimum Passing Grade ({coursePassingGrade}). Anda berhak melanjutkan ke evaluasi pelatihan untuk penerbitan E-Sertifikat resmi.
									{/if}
								</p>
							</div>
						</div>
					{:else}
						<div class="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3">
							<span class="material-symbols-outlined text-2xl text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">cancel</span>
							<div class="space-y-1 text-xs">
								<div class="font-black text-rose-900 dark:text-rose-200">
									BELUM MENCAPAI PASSING GRADE ({coursePassingGrade})
								</div>
								<p class="text-rose-700 dark:text-rose-300 leading-relaxed text-[11px]">
									Nilai Post-Test Anda adalah <strong>{postScoreVal}/100</strong>. Sesuai standar mutu pembelajaran, hasil tercatat murni apa adanya. Silakan tinjau kembali modul pembelajaran agar pemahaman materi lebih optimal.
								</p>
							</div>
						</div>
					{/if}

					<!-- Tinjauan Jawaban Soal Essay Peserta -->
					{#if postTestQuestions.some((q) => q.questionType === 'ESSAY' || !q.options || q.options.length === 0)}
						<div class="space-y-3 pt-2">
							<div class="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
								<span class="material-symbols-outlined text-base text-amber-500">rate_review</span>
								<span>Tinjauan Jawaban Uraian (Essay)</span>
							</div>
							<div class="space-y-3 max-h-56 overflow-y-auto pr-1">
								{#each postTestQuestions.filter((q) => q.questionType === 'ESSAY' || !q.options || q.options.length === 0) as eq, eIdx}
									{@const valAns = postAnswers[eq.id] || (data.enrollment?.postTestAnswers as any)?.[eq.id] || ''}
									<div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
										<div class="flex items-start justify-between gap-2">
											<p class="font-bold text-slate-900 dark:text-white">
												{eq.questionText}
											</p>
											<span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shrink-0">
												Menunggu Review
											</span>
										</div>
										<div class="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 italic whitespace-pre-wrap">
											"{valAns || '(Jawaban telah tersimpan di sistem)'}"
										</div>
										{#if eq.explanation}
											<div class="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
												<span class="material-symbols-outlined text-xs text-amber-500">info</span>
												<span>Panduan / Rubrik: {eq.explanation}</span>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Tombol Aksi Modal -->
					<div class="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
						<button
							type="button"
							onclick={() => (showComparisonModal = false)}
							class="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
						>
							Tutup
						</button>
						{#if hasEssayPending}
							<button
								type="button"
								onclick={() => {
									showComparisonModal = false;
									currentStep = 4;
								}}
								class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-lg shadow-amber-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
							>
								<span>Lanjut ke Evaluasi (Step 4)</span>
								<span class="material-symbols-outlined text-sm">arrow_forward</span>
							</button>
						{:else if isTestPassed}
							{#if hasActiveCertificate}
								<button
									type="button"
									onclick={() => {
										showComparisonModal = false;
										currentStep = 4;
									}}
									class="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
								>
									<span>Evaluasi (Opsional)</span>
									<span class="material-symbols-outlined text-sm">rate_review</span>
								</button>
								<button
									type="button"
									onclick={() => {
										showComparisonModal = false;
										currentStep = 5;
									}}
									class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
								>
									<span>Buka E-Sertifikat Aktif</span>
									<span class="material-symbols-outlined text-sm">workspace_premium</span>
								</button>
							{:else}
								<button
									type="button"
									onclick={() => {
										showComparisonModal = false;
										currentStep = 4;
									}}
									class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
								>
									<span>Lanjut ke Evaluasi Kepuasan</span>
									<span class="material-symbols-outlined text-sm">arrow_forward</span>
								</button>
							{/if}
						{:else}
							<button
								type="button"
								onclick={() => {
									showComparisonModal = false;
									currentStep = 2;
								}}
								class="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-1.5"
							>
								<span>Tinjau Materi Modul</span>
								<span class="material-symbols-outlined text-sm">menu_book</span>
							</button>

							{#if attemptsCount < 2}
								<button
									type="button"
									onclick={() => {
										showComparisonModal = false;
										isRetryingPostTest = true;
										postAnswers = {};
										currentStep = 3;
									}}
									class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-lg shadow-amber-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
								>
									<span>Ulangi Post-Test (Sisa 1x)</span>
									<span class="material-symbols-outlined text-sm">refresh</span>
								</button>
							{:else}
								<button
									type="button"
									onclick={() => {
										showComparisonModal = false;
										currentStep = 4;
									}}
									class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
								>
									<span>Lanjut ke Evaluasi</span>
									<span class="material-symbols-outlined text-sm">arrow_forward</span>
								</button>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		{/if}

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<!-- TAHAP 4: EVALUASI KEPUASAN (KIRKPATRICK LEVEL 1)                         -->
	<!-- ════════════════════════════════════════════════════════════════════════ -->
	{:else if currentStep === 4}
		<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-8">
			<!-- Header Banner Evaluasi Level 1 -->
			<div class="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-pink-900/10 border border-purple-500/30 space-y-2">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div class="flex items-center gap-2.5">
						<span class="p-2 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 material-symbols-outlined text-2xl">rate_review</span>
						<div>
							<h3 class="font-black text-base md:text-lg text-slate-900 dark:text-white">Tahap 4: Evaluasi Kepuasan Pelatihan (Kirkpatrick Level 1)</h3>
							<p class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Standar Penjaminan Mutu & Mutasi Pembelajaran PT Buana Centra Swakarsa</p>
						</div>
					</div>
					<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
						Mandatory Gate Sertifikat
					</span>
				</div>
				<p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
					Sesuai prosedur baku mutu LMS, seluruh 18 indikator (15 butir aspek teknis & 3 butir uraian kualitatif) wajib dilengkapi secara objektif. Pengisian ini menjadi prasyarat pembukaan <strong>E-Sertifikat Digital (Masa Berlaku 1 Tahun)</strong> Anda.
				</p>
			</div>

			{#if isEvaluationSubmitted}
				<!-- Evaluasi Terkunci Permanen -->
				<div class="p-8 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/60 text-center space-y-4">
					<div class="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
						<span class="material-symbols-outlined text-3xl">task_alt</span>
					</div>
					<div class="max-w-md mx-auto space-y-2">
						<h3 class="text-lg font-black text-slate-900 dark:text-white">
							Evaluasi Pelatihan Telah Berhasil Disubmit
						</h3>
						<p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
							Terima kasih atas penilaian dan masukan yang Anda berikan. Formulir evaluasi Kirkpatrick Level 1 ini telah tersimpan secara permanen dan tidak dapat diisi ulang untuk materi pelatihan yang sama.
						</p>
					</div>
					<div class="pt-2 flex flex-wrap items-center justify-center gap-3">
						<button
							type="button"
							onclick={() => (currentStep = 2)}
							class="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
						>
							<span class="material-symbols-outlined text-sm">menu_book</span>
							<span>Tinjau Materi Pembelajaran</span>
						</button>
						<button
							type="button"
							onclick={() => (currentStep = 5)}
							class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
						>
							<span class="material-symbols-outlined text-sm">workspace_premium</span>
							<span>Lihat E-Sertifikat Resmi</span>
						</button>
					</div>
				</div>
			{:else}
				<!-- Live Completion Counter & Preset Tools -->
				<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-base {isEvaluationComplete ? 'text-emerald-500' : 'text-indigo-500'}">
								{isEvaluationComplete ? 'check_circle' : 'pending_actions'}
							</span>
							<span class="font-black text-slate-900 dark:text-white">Status Kelengkapan Evaluasi:</span>
							<span class="font-mono font-bold {isEvaluationComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}">
								{totalAnsweredCount} dari 18 Butir Terisi ({completionPercent}%)
							</span>
						</div>

						<div class="flex items-center gap-2">
							<span class="text-[10px] font-bold text-slate-500">Pintasan Cepat:</span>
							<button
								type="button"
								onclick={() => setAllLikertScore(5)}
								class="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
							>
								Setel Semua Skor 5 (Sangat Baik)
							</button>
							<button
								type="button"
								onclick={() => setAllLikertScore(4)}
								class="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
							>
								Setel Semua Skor 4 (Baik)
							</button>
						</div>
					</div>

					<!-- Visual Progress Bar -->
					<div class="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
						<div
							class="h-full transition-all duration-300 rounded-full {isEvaluationComplete ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}"
							style="width: {completionPercent}%"
						></div>
					</div>
				</div>

				<form
					method="POST"
					action="?/submitEvaluationL1"
					use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
					};
				}}
				class="space-y-8"
			>
				<input type="hidden" name="deliveryMethod" value={deliveryMethod} />

				<!-- ────────────────────────────────────────────────────────── -->
				<!-- KATEGORI 1: PROGRAM & MATERI PELATIHAN (5 BUTIR)           -->
				<!-- ────────────────────────────────────────────────────────── -->
				<div class="space-y-4">
					<div class="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
						<span class="px-2.5 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase">
							Kategori 1 • 5 Butir
						</span>
						<h4 class="font-black text-sm md:text-base text-slate-900 dark:text-white">Program & Materi Pelatihan</h4>
					</div>

					<div class="space-y-3">
						{#each materialQuestions as q (q.id)}
							<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 transition-all hover:border-indigo-300 dark:hover:border-indigo-700/60">
								<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
									<div>
										<p class="text-xs font-black text-slate-900 dark:text-white">{q.number}. {q.title}</p>
										<p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{q.desc}</p>
									</div>
									<span class="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0 self-start">
										Skor: {evalLikert[q.id] || 5}/5
									</span>
								</div>

								<!-- Horizontal Pills Selector 1-5 -->
								<div class="grid grid-cols-5 gap-1.5 sm:gap-2">
									{#each ratingScaleLabels as scale}
										{@const isSelected = (evalLikert[q.id] || 5) === scale.score}
										<button
											type="button"
											onclick={() => evalLikert[q.id] = scale.score}
											class="py-2 px-1 sm:px-2 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-0.5 border cursor-pointer {
												isSelected 
													? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/40 font-black' 
													: 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
											}"
										>
											<div class="flex items-center gap-1">
												<span class="text-xs sm:text-sm font-black">{scale.score}</span>
												{#if isSelected}
													<span class="material-symbols-outlined text-[13px]">check</span>
												{/if}
											</div>
											<span class="text-[9px] sm:text-[10px] leading-tight truncate font-medium {isSelected ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}">
												{scale.label}
											</span>
										</button>
									{/each}
								</div>
								<!-- Hidden native input agar form data terbaca server action -->
								<input type="hidden" name={q.id} value={evalLikert[q.id] || 5} />
							</div>
						{/each}
					</div>
				</div>

				<!-- ────────────────────────────────────────────────────────── -->
				<!-- KATEGORI 2: INSTRUKTUR / TRAINER (4 BUTIR)                 -->
				<!-- ────────────────────────────────────────────────────────── -->
				<div class="space-y-4">
					<div class="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
						<span class="px-2.5 py-0.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-black uppercase">
							Kategori 2 • 4 Butir
						</span>
						<h4 class="font-black text-sm md:text-base text-slate-900 dark:text-white">Instruktur / Trainer Pembelajaran</h4>
					</div>

					<div class="space-y-3">
						{#each instructorQuestions as q (q.id)}
							<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 transition-all hover:border-teal-300 dark:hover:border-teal-700/60">
								<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
									<div>
										<p class="text-xs font-black text-slate-900 dark:text-white">{q.number}. {q.title}</p>
										<p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{q.desc}</p>
									</div>
									<span class="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 shrink-0 self-start">
										Skor: {evalLikert[q.id] || 5}/5
									</span>
								</div>

								<!-- Horizontal Pills Selector 1-5 -->
								<div class="grid grid-cols-5 gap-1.5 sm:gap-2">
									{#each ratingScaleLabels as scale}
										{@const isSelected = (evalLikert[q.id] || 5) === scale.score}
										<button
											type="button"
											onclick={() => evalLikert[q.id] = scale.score}
											class="py-2 px-1 sm:px-2 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-0.5 border cursor-pointer {
												isSelected 
													? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-400/40 font-black' 
													: 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
											}"
										>
											<div class="flex items-center gap-1">
												<span class="text-xs sm:text-sm font-black">{scale.score}</span>
												{#if isSelected}
													<span class="material-symbols-outlined text-[13px]">check</span>
												{/if}
											</div>
											<span class="text-[9px] sm:text-[10px] leading-tight truncate font-medium {isSelected ? 'text-teal-100' : 'text-slate-400 dark:text-slate-500'}">
												{scale.label}
											</span>
										</button>
									{/each}
								</div>
								<input type="hidden" name={q.id} value={evalLikert[q.id] || 5} />
							</div>
						{/each}
					</div>
				</div>

				<!-- ────────────────────────────────────────────────────────── -->
				<!-- KATEGORI 3: SARANA & MEDIA PEMBELAJARAN LMS (6 BUTIR)       -->
				<!-- ────────────────────────────────────────────────────────── -->
				<div class="space-y-4">
					<div class="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
						<span class="px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase">
							Kategori 3 • 6 Butir
						</span>
						<h4 class="font-black text-sm md:text-base text-slate-900 dark:text-white">Sarana & Media Pembelajaran LMS</h4>
					</div>

					<div class="space-y-3">
						{#each facilityQuestions as q (q.id)}
							<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 transition-all hover:border-blue-300 dark:hover:border-blue-700/60">
								<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
									<div>
										<p class="text-xs font-black text-slate-900 dark:text-white">{q.number}. {q.title}</p>
										<p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{q.desc}</p>
									</div>
									<span class="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0 self-start">
										Skor: {evalLikert[q.id] || 5}/5
									</span>
								</div>

								<!-- Horizontal Pills Selector 1-5 -->
								<div class="grid grid-cols-5 gap-1.5 sm:gap-2">
									{#each ratingScaleLabels as scale}
										{@const isSelected = (evalLikert[q.id] || 5) === scale.score}
										<button
											type="button"
											onclick={() => evalLikert[q.id] = scale.score}
											class="py-2 px-1 sm:px-2 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-0.5 border cursor-pointer {
												isSelected 
													? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/40 font-black' 
													: 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
											}"
										>
											<div class="flex items-center gap-1">
												<span class="text-xs sm:text-sm font-black">{scale.score}</span>
												{#if isSelected}
													<span class="material-symbols-outlined text-[13px]">check</span>
												{/if}
											</div>
											<span class="text-[9px] sm:text-[10px] leading-tight truncate font-medium {isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}">
												{scale.label}
											</span>
										</button>
									{/each}
								</div>
								<input type="hidden" name={q.id} value={evalLikert[q.id] || 5} />
							</div>
						{/each}
					</div>
				</div>

				<!-- ────────────────────────────────────────────────────────── -->
				<!-- KATEGORI 4: URAIAN KUALITATIF (3 PERTANYAAN ESAI)          -->
				<!-- ────────────────────────────────────────────────────────── -->
				<div class="space-y-4">
					<div class="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
						<span class="px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase">
							Kategori 4 • 3 Butir
						</span>
						<h4 class="font-black text-sm md:text-base text-slate-900 dark:text-white">Uraian Kualitatif & Rekomendasi Terbuka</h4>
					</div>

					<div class="space-y-4">
						<!-- Butir 16: Rencana Penerapan -->
						<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
							<label for="appliedBenefitArea" class="block text-xs font-black text-slate-900 dark:text-white">
								16. Rencana Penerapan di Unit Kerja
							</label>
							<p class="text-[11px] text-slate-500 dark:text-slate-400">
								Manfaat, sistem, metode kerja, atau standar keselamatan apa yang menurut Anda paling dapat langsung diterapkan dalam operasional tugas harian?
							</p>
							<textarea
								id="appliedBenefitArea"
								name="appliedBenefit"
								bind:value={appliedBenefit}
								rows="2"
								required
								placeholder="Tuliskan rencana penerapan konkrit pada tugas operasional Anda..."
								class="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
							></textarea>
						</div>

						<!-- Butir 17: Kesan Peserta -->
						<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
							<label for="impressionsArea" class="block text-xs font-black text-slate-900 dark:text-white">
								17. Kesan Peserta Selama Pembelajaran
							</label>
							<p class="text-[11px] text-slate-500 dark:text-slate-400">
								Bagikan kesan positif atau pengalaman berharga Anda selama mempelajari kursus ini di BCS Academy.
							</p>
							<textarea
								id="impressionsArea"
								name="impressions"
								bind:value={impressions}
								rows="2"
								required
								placeholder="Tuliskan kesan Anda selama mengikuti materi kursus..."
								class="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
							></textarea>
						</div>

						<!-- Butir 18: Saran Konstruktif -->
						<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
							<label for="suggestionsArea" class="block text-xs font-black text-slate-900 dark:text-white">
								18. Saran Konstruktif untuk Perbaikan Program
							</label>
							<p class="text-[11px] text-slate-500 dark:text-slate-400">
								Saran perbaikan untuk materi, metode pelatihan, kelancaran platform LMS, atau topik kursus lanjutan yang dibutuhkan.
							</p>
							<textarea
								id="suggestionsArea"
								name="suggestions"
								bind:value={suggestions}
								rows="2"
								required
								placeholder="Tuliskan masukan konstruktif untuk pengembangan pelatihan berikutnya..."
								class="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
							></textarea>
						</div>
					</div>
				</div>

				<!-- Tombol Submit Form Evaluasi Level 1 -->
				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
					<div class="text-xs text-slate-500 dark:text-slate-400">
						{#if !isEvaluationComplete}
							<span class="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
								<span class="material-symbols-outlined text-sm">warning</span>
								<span>Harap lengkapi seluruh butir pertanyaan sebelum menerbitkan sertifikat.</span>
							</span>
						{:else}
							<span class="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
								<span class="material-symbols-outlined text-sm">verified</span>
								<span>Seluruh 18 butir indikator lengkap terisi. Siap diterbitkan!</span>
							</span>
						{/if}
					</div>

					<button
						type="submit"
						disabled={isSubmitting || !isEvaluationComplete}
						class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<span>{isSubmitting ? 'Memproses Masukan...' : (hasActiveCertificate ? 'Perbarui Masukan & Buka Sertifikat' : 'Kirim Evaluasi & Buka E-Sertifikat Resmi')}</span>
						<span class="material-symbols-outlined text-base">workspace_premium</span>
					</button>
				</div>
			</form>
			{/if}
		</div>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<!-- TAHAP 5: E-SERTIFIKAT DIGITAL RESMI (MASA BERLAKU 1 TAHUN)                -->
	<!-- ════════════════════════════════════════════════════════════════════════ -->
	{:else if currentStep === 5}
		<div class="space-y-6">
			{#if hasEssayPending && !activeCert}
				<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-xl text-center space-y-6 max-w-2xl mx-auto">
					<div class="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto">
						<span class="material-symbols-outlined text-4xl">hourglass_top</span>
					</div>
					<div class="space-y-2">
						<h3 class="text-xl font-black text-slate-900 dark:text-white">
							E-Sertifikat Menunggu Penilaian Uraian Instruktur
						</h3>
						<p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
							Anda telah berhasil menyelesaikan seluruh modul pembelajaran dan formulir evaluasi kepuasan. Butir jawaban soal uraian (Essay) Anda saat ini sedang dalam proses peninjauan dan penilaian manual oleh instruktur/HR.
						</p>
					</div>

					<div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 space-y-1 text-left">
						<div class="font-bold flex items-center gap-1.5">
							<span class="material-symbols-outlined text-sm">info</span>
							Ketentuan Penerbitan E-Sertifikat:
						</div>
						<p class="text-[11px] leading-relaxed">
							E-sertifikat resmi ber-barcode akan otomatis diterbitkan di halaman ini dan tab <strong>Sertifikat Saya</strong> setelah instruktur menyelesaikan koreksi essay hingga total skor akhir mencapai passing grade ({coursePassingGrade}).
						</p>
					</div>

					<div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
						<button
							type="button"
							onclick={() => (currentStep = 2)}
							class="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2"
						>
							<span class="material-symbols-outlined text-base">menu_book</span>
							<span>Tinjau Kembali Materi Modul</span>
						</button>
						<a
							href="/"
							class="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
						>
							<span class="material-symbols-outlined text-base">home</span>
							<span>Kembali ke Beranda</span>
						</a>
					</div>
				</div>
			{:else}
				<!-- Banner Konfirmasi Evaluasi Selesai & Sertifikat Aktif -->
				<div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 flex items-start sm:items-center justify-between gap-3">
					<div class="flex items-center gap-3">
						<span class="material-symbols-outlined text-2xl text-emerald-600 dark:text-emerald-400 shrink-0">verified</span>
						<div>
							<p class="text-xs font-black text-emerald-900 dark:text-emerald-200">
								E-Sertifikat Digital Resmi Aktif (Nilai: {activeCert?.score || postScoreVal}/100)
							</p>
							<p class="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
								Sertifikat kompetensi ini berlaku sah selama <strong>1 Tahun</strong> hingga <strong>{activeCert?.validUntil || '1 Tahun Mendatang'}</strong>.
							</p>
						</div>
					</div>
					<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shrink-0">
						Valid 1 Tahun
					</span>
				</div>

				<!-- Kartu Sertifikat Resmi PT BCS -->
				<div class="relative bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border-4 border-amber-500/60 rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden print:m-0 print:border-2">
				<!-- Background watermark / accent -->
				<div class="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

				<div class="relative z-10 text-center space-y-6">
					<!-- Logo & Header Perusahaan -->
					<div class="space-y-1">
						<div class="flex items-center justify-center gap-2">
							<span class="material-symbols-outlined text-3xl text-amber-400">verified</span>
							<h4 class="font-mono text-xs font-black tracking-widest text-amber-400 uppercase">PT BUANA CENTRA SWAKARSA</h4>
						</div>
						<h1 class="text-xl md:text-3xl font-black uppercase tracking-wider text-white">SERTIFIKAT KELULUSAN RESMI</h1>
						<p class="text-xs text-slate-400 font-mono">BCS ACADEMY & HRIS CONTINUOUS LEARNING PROGRAM</p>
					</div>

					<div class="w-24 h-1 bg-gradient-to-r from-amber-400 to-indigo-500 mx-auto rounded-full"></div>

					<!-- Penerima Sertifikat -->
					<div class="space-y-1">
						<p class="text-xs uppercase tracking-widest text-slate-400 font-medium">Diberikan Kepada:</p>
						<h2 class="text-2xl md:text-3xl font-black text-amber-300 font-serif underline decoration-amber-500/40 underline-offset-8">
							{activeCert?.employeeName || 'Karyawan PT BCS'}
						</h2>
						<p class="text-xs font-mono text-slate-400 mt-1">NIP: {activeCert?.payrollId || 'EMP-XXXX'}</p>
					</div>

					<!-- Keterangan Kelulusan -->
					<p class="text-xs md:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
						Telah menyelesaikan secara tuntas seluruh tahapan pelatihan, evaluasi kepuasan (Kirkpatrick Level 1), dan dinyatakan <strong>LULUS KUALIFIKASI STANDAR</strong> pada program:
					</p>

					<div class="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-xl mx-auto space-y-1.5">
						<h3 class="text-base md:text-lg font-black text-white">{course.title}</h3>
						<p class="text-xs text-indigo-300">Kategori: {course.category} • Durasi: {course.durationHours} Jam</p>
						
						<!-- Badge Masa Berlaku 1 Tahun di Dalam Sertifikat -->
						<div class="pt-1">
							<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold">
								<span class="material-symbols-outlined text-sm">schedule</span>
								<span>Masa Berlaku: 1 Tahun (Hingga {activeCert?.validUntil || '1 Tahun Mendatang'})</span>
							</span>
						</div>
					</div>

					<!-- Nomor & QR Verifikasi -->
					<div class="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto text-xs">
						<div class="text-left space-y-1">
							<p class="text-[10px] text-slate-400 uppercase font-bold">Nomor Sertifikat:</p>
							<p class="font-mono font-black text-amber-400 text-sm">{activeCert?.certificateNumber || 'CERT-BCS-2026-0000'}</p>
							<p class="text-[10px] text-slate-400">Diterbitkan: {activeCert?.issuedAt || new Date().toISOString().split('T')[0]}</p>
							<p class="text-[10px] text-emerald-400 font-bold">Berlaku Hingga: {activeCert?.validUntil || '-'}</p>
						</div>

						<div class="text-right space-y-1">
							<p class="text-[10px] text-slate-400 uppercase font-bold">Diverifikasi Oleh:</p>
							<p class="font-bold text-white">Management & Training Center</p>
							<p class="text-[10px] text-slate-400">PT Buana Centra Swakarsa</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex flex-wrap items-center justify-center gap-3 pt-2">
				<button
					type="button"
					onclick={() => window.print()}
					class="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
				>
					<span class="material-symbols-outlined text-sm">print</span>
					<span>Cetak / Unduh PDF Sertifikat</span>
				</button>

				<a
					href="/certificates"
					class="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition-all flex items-center gap-2"
				>
					<span class="material-symbols-outlined text-sm">folder_shared</span>
					<span>Lihat Semua E-Sertifikat Saya</span>
				</a>

				<a
					href="/"
					class="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold transition-all flex items-center gap-2"
				>
					<span class="material-symbols-outlined text-sm">home</span>
					<span>Kembali ke Beranda</span>
				</a>
			</div>
			{/if}
		</div>
	{/if}
	{/if}
</div>
