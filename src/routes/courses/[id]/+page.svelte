<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

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

	// State Jawaban & Evaluasi
	let preAnswers = $state<Record<number, string>>({});
	let postAnswers = $state<Record<number, string>>({});
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

	// Sinkronisasi step berdasarkan kembalian server action
	$effect(() => {
		if (form && form.success) {
			if (form.step) {
				currentStep = form.step as 1 | 2 | 3 | 4 | 5;
			}
			if (form.certificate) {
				activeCert = form.certificate;
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

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<!-- STEPPER HEADER 5 TAHAP                                                   -->
	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
		<div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
			<!-- Step 1 -->
			<button
				type="button"
				onclick={() => { if (currentStep > 1) currentStep = 1; }}
				class="flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all {currentStep === 1 ? 'bg-indigo-600 text-white shadow-md font-black' : currentStep > 1 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' : 'text-slate-400 opacity-60'}"
			>
				<span class="material-symbols-outlined text-xl {currentStep > 1 ? 'text-emerald-600 dark:text-emerald-400' : ''}">
					{currentStep > 1 ? 'check_circle' : 'assignment'}
				</span>
				<div class="min-w-0">
					<p class="text-[10px] uppercase font-bold tracking-wider opacity-80">Tahap 1</p>
					<p class="text-xs truncate font-bold">Pre-Test</p>
				</div>
			</button>

			<!-- Step 2 -->
			<button
				type="button"
				onclick={() => { if (data.enrollment?.preTestScore !== null || currentStep > 2) currentStep = 2; }}
				class="flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all {currentStep === 2 ? 'bg-indigo-600 text-white shadow-md font-black' : currentStep > 2 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' : 'text-slate-400 opacity-60'}"
			>
				<span class="material-symbols-outlined text-xl {currentStep > 2 ? 'text-emerald-600 dark:text-emerald-400' : ''}">
					{currentStep > 2 ? 'check_circle' : 'play_lesson'}
				</span>
				<div class="min-w-0">
					<p class="text-[10px] uppercase font-bold tracking-wider opacity-80">Tahap 2</p>
					<p class="text-xs truncate font-bold">Modul Materi</p>
				</div>
			</button>

			<!-- Step 3 -->
			<button
				type="button"
				onclick={() => { if (currentStep >= 3) currentStep = 3; }}
				class="flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all {currentStep === 3 ? 'bg-indigo-600 text-white shadow-md font-black' : currentStep > 3 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' : 'text-slate-400 opacity-60'}"
			>
				<span class="material-symbols-outlined text-xl {currentStep > 3 ? 'text-emerald-600 dark:text-emerald-400' : ''}">
					{currentStep > 3 ? 'check_circle' : 'quiz'}
				</span>
				<div class="min-w-0">
					<p class="text-[10px] uppercase font-bold tracking-wider opacity-80">Tahap 3</p>
					<p class="text-xs truncate font-bold">Post-Test</p>
				</div>
			</button>

			<!-- Step 4 -->
			<button
				type="button"
				onclick={() => { if (currentStep >= 4) currentStep = 4; }}
				class="flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all {currentStep === 4 ? 'bg-indigo-600 text-white shadow-md font-black' : currentStep > 4 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' : 'text-slate-400 opacity-60'}"
			>
				<span class="material-symbols-outlined text-xl {currentStep > 4 ? 'text-emerald-600 dark:text-emerald-400' : ''}">
					{currentStep > 4 ? 'check_circle' : 'rate_review'}
				</span>
				<div class="min-w-0">
					<p class="text-[10px] uppercase font-bold tracking-wider opacity-80">Tahap 4</p>
					<p class="text-xs truncate font-bold">Evaluasi L1</p>
				</div>
			</button>

			<!-- Step 5 -->
			<button
				type="button"
				onclick={() => { if (currentStep === 5 || activeCert) currentStep = 5; }}
				class="col-span-2 sm:col-span-1 flex items-center gap-2 p-2.5 rounded-2xl text-left transition-all {currentStep === 5 ? 'bg-emerald-600 text-white shadow-md font-black' : activeCert ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' : 'text-slate-400 opacity-60'}"
			>
				<span class="material-symbols-outlined text-xl">
					{activeCert ? 'verified' : 'workspace_premium'}
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
				<div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<span class="material-symbols-outlined text-2xl text-emerald-600 dark:text-emerald-400">check_circle</span>
						<div>
							<p class="text-xs font-bold text-emerald-900 dark:text-emerald-200">Anda telah menyelesaikan Pre-Test sebelumnya</p>
							<p class="text-[11px] text-emerald-700 dark:text-emerald-400">Nilai baseline tercatat: <strong>{data.enrollment.preTestScore}/100</strong></p>
						</div>
					</div>
					<button
						type="button"
						onclick={() => (currentStep = 2)}
						class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
					>
						Lanjut ke Modul Materi &rarr;
					</button>
				</div>
			{/if}

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
						<div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
							<div class="flex items-start gap-3">
								<span class="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">
									{idx + 1}
								</span>
								<p class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
									{q.questionText}
								</p>
							</div>

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
		</div>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<!-- TAHAP 2: MODUL MATERI PEMBELAJARAN (VIDEO & DOKUMEN)                     -->
	<!-- ════════════════════════════════════════════════════════════════════════ -->
	{:else if currentStep === 2}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Canvas Pemutar Video / Dokumen -->
			<div class="lg:col-span-2 space-y-4">
				<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col">
					<!-- Player Canvas -->
					<div class="bg-slate-900 text-white p-6 min-h-[380px] flex flex-col justify-between">
						<div class="aspect-video w-full bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden">
							<div class="w-16 h-16 rounded-3xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse">
								<span class="material-symbols-outlined text-3xl">play_circle</span>
							</div>
							<h4 class="font-black text-sm md:text-base text-white max-w-md">
								{currentModule.title}
							</h4>
							<p class="text-xs text-slate-400">
								Bab {activeModuleIndex + 1} dari {course.modules.length} • Durasi: {currentModule.durationText} • Format: {currentModule.type}
							</p>
						</div>

						<!-- Controls Bawah Video -->
						<div class="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<span class="text-xs text-slate-400">Trainer: {course.instructor}</span>

							<div class="flex items-center gap-2">
								<button
									type="button"
									disabled={activeModuleIndex === 0}
									onclick={prevModule}
									class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-white transition-all cursor-pointer"
								>
									&larr; Bab Sebelumnya
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
								<p class="text-[10px] opacity-70 mt-0.5">{mod.durationText} • {mod.type}</p>
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
						Passing Grade 75%
					</span>
				</div>
				<p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
					Buktikan pemahaman Anda setelah mempelajari materi. Dapatkan nilai minimal <strong>75/100</strong> untuk dinyatakan lulus dan melanjutkan ke penerbitan sertifikat digital resmi.
				</p>
			</div>

			<!-- Feedback Hasil Post-Test jika ada -->
			{#if form && form.actionType === 'POST_TEST'}
				{#if form.isPassed}
					<div class="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 text-center space-y-3">
						<span class="material-symbols-outlined text-4xl text-emerald-600">verified</span>
						<div>
							<h4 class="font-black text-base text-emerald-900 dark:text-emerald-200">Selamat! Anda Lulus Post-Test</h4>
							<p class="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Nilai Anda: <strong>{form.score}/100</strong> (Passing Grade: 75)</p>
						</div>
						<button
							type="button"
							onclick={() => (currentStep = 4)}
							class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
						>
							Lanjut ke Evaluasi Kepuasan (Level 1) &rarr;
						</button>
					</div>
				{:else}
					<div class="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 text-center space-y-3">
						<span class="material-symbols-outlined text-4xl text-rose-600">cancel</span>
						<div>
							<h4 class="font-black text-base text-rose-900 dark:text-rose-200">Belum Mencapai Passing Grade</h4>
							<p class="text-xs text-rose-700 dark:text-rose-400 mt-0.5">Nilai Anda: <strong>{form.score}/100</strong> (Passing Grade: 75). Silakan ulangi post-test (remedial).</p>
						</div>
						<div class="flex items-center justify-center gap-2">
							<button
								type="button"
								onclick={() => (currentStep = 2)}
								class="px-4 py-2 rounded-xl border border-rose-300 text-xs font-bold text-rose-800 dark:text-rose-300 hover:bg-rose-100 cursor-pointer"
							>
								Tinjau Materi Modul
							</button>
						</div>
					</div>
				{/if}
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
						<div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
							<div class="flex items-start gap-3">
								<span class="w-6 h-6 rounded-lg bg-amber-600 text-white text-xs font-black flex items-center justify-center shrink-0">
									{idx + 1}
								</span>
								<p class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
									{q.questionText}
								</p>
							</div>

							<div class="space-y-2 pl-9">
								{#each q.options as opt}
									<label class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer">
										<input
											type="radio"
											name="post_{q.id}"
											value={opt.key}
											bind:group={postAnswers[q.id]}
											required
											class="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
										/>
										<span class="text-xs text-slate-800 dark:text-slate-200 font-medium">
											<strong class="font-bold text-amber-600 dark:text-amber-400">{opt.key}.</strong> {opt.text}
										</span>
									</label>
								{/each}
							</div>
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
						<span>{isSubmitting ? 'Memeriksa Jawaban...' : 'Kirim Jawaban Post-Test'}</span>
						<span class="material-symbols-outlined text-sm">verified</span>
					</button>
				</div>
			</form>
		</div>

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
						<span>{isSubmitting ? 'Memproses E-Sertifikat...' : 'Kirim Evaluasi & Buka E-Sertifikat Resmi'}</span>
						<span class="material-symbols-outlined text-base">workspace_premium</span>
					</button>
				</div>
			</form>
		</div>

	<!-- ════════════════════════════════════════════════════════════════════════ -->
	<!-- TAHAP 5: E-SERTIFIKAT DIGITAL RESMI (MASA BERLAKU 1 TAHUN)                -->
	<!-- ════════════════════════════════════════════════════════════════════════ -->
	{:else if currentStep === 5}
		<div class="space-y-6">
			<!-- Banner Konfirmasi Evaluasi Selesai & Sertifikat Aktif -->
			<div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 flex items-start sm:items-center justify-between gap-3">
				<div class="flex items-center gap-3">
					<span class="material-symbols-outlined text-2xl text-emerald-600 dark:text-emerald-400 shrink-0">verified</span>
					<div>
						<p class="text-xs font-black text-emerald-900 dark:text-emerald-200">
							Evaluasi Kirkpatrick Level 1 Telah Diterima & E-Sertifikat Aktif
						</p>
						<p class="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
							Sertifikat digital resmi ini berlaku selama <strong>1 Tahun</strong> sejak tanggal penerbitan.
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
		</div>
	{/if}
</div>
