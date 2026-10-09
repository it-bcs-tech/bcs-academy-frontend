<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { enrollments, user } = data;

	let filter = $state<'all' | 'in_progress' | 'completed'>('all');

	let filteredEnrollments = $derived(
		enrollments.filter((e: any) => {
			if (filter === 'in_progress') return e.status === 'IN_PROGRESS';
			if (filter === 'completed') return e.status === 'COMPLETED';
			return true;
		})
	);

	const inProgressCount = $derived(enrollments.filter((e: any) => e.status === 'IN_PROGRESS').length);
	const completedCount = $derived(enrollments.filter((e: any) => e.status === 'COMPLETED').length);
	const certificateCount = $derived(data.certificates?.length || 0);
</script>

<svelte:head>
	<title>Beranda Belajar | BCS Academy</title>
</svelte:head>

<div class="space-y-6">
	<!-- WELCOME HERO BANNER -->
	<div class="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 border border-indigo-800/40 shadow-xl overflow-hidden">
		<div class="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

		<div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
			<div class="space-y-2">
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
					<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
					<span>Peserta Aktif Academy</span>
				</div>
				<h1 class="text-2xl md:text-3xl font-black text-white tracking-tight">
					Selamat Datang, {user?.name || 'Karyawan BCS'}!
				</h1>
				<p class="text-xs md:text-sm text-slate-300 font-medium">
					{user?.title || 'Staff Operasional'} • Divisi {user?.division || 'BCS Logistics'} ({user?.payrollId})
				</p>
			</div>

			<!-- Quick KPI badges -->
			<div class="grid grid-cols-3 gap-3 bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-800 text-center flex-shrink-0">
				<div>
					<p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sedang Belajar</p>
					<p class="text-xl font-black text-white">{inProgressCount}</p>
				</div>
				<div class="border-x border-slate-800 px-3">
					<p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lulus</p>
					<p class="text-xl font-black text-emerald-400">{completedCount}</p>
				</div>
				<div>
					<p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sertifikat</p>
					<p class="text-xl font-black text-amber-400">{certificateCount}</p>
				</div>
			</div>
		</div>
	</div>

	{#if enrollments.length === 0}
		<!-- EMPTY STATE JIKA BELUM ADA KURSUS DITAUTKAN -->
		<div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 text-center space-y-5 shadow-sm">
			<div class="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
				<span class="material-symbols-outlined text-4xl">school</span>
			</div>
			
			<div class="max-w-md mx-auto space-y-2">
				<h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">
					Belum Ada Kursus Ditugaskan
				</h2>
				<p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
					Akun Anda saat ini belum memiliki penugasan pelatihan aktif dari Human Capital / Training & Development (TnD). Silakan hubungi atasan langsung Anda atau jelajahi modul pada katalog pelatihan.
				</p>
			</div>

			<div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
				<a 
					href="/catalog" 
					class="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
				>
					<span class="material-symbols-outlined text-base">menu_book</span>
					<span>Jelajahi Katalog Pelatihan</span>
				</a>
			</div>
		</div>
	{:else}
		<!-- FILTER & SECTION TITLE -->
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
			<div>
				<h2 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">Kursus & Pelatihan Saya</h2>
				<p class="text-xs text-slate-500 dark:text-slate-400">Lanjutkan materi dan evaluasi kuis untuk mendapatkan sertifikasi.</p>
			</div>

			<!-- Segmented Filter -->
			<div class="inline-flex p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 text-xs font-bold">
				<button 
					type="button" 
					onclick={() => (filter = 'all')} 
					class="px-3.5 py-1.5 rounded-xl transition-all cursor-pointer {filter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
				>
					Semua ({enrollments.length})
				</button>
				<button 
					type="button" 
					onclick={() => (filter = 'in_progress')} 
					class="px-3.5 py-1.5 rounded-xl transition-all cursor-pointer {filter === 'in_progress' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
				>
					Sedang Berjalan ({inProgressCount})
				</button>
				<button 
					type="button" 
					onclick={() => (filter = 'completed')} 
					class="px-3.5 py-1.5 rounded-xl transition-all cursor-pointer {filter === 'completed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
				>
					Selesai ({completedCount})
				</button>
			</div>
		</div>

		<!-- MY COURSES LIST -->
		{#if filteredEnrollments.length === 0}
			<div class="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
				Tidak ada kursus pada filter ini.
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
				{#each filteredEnrollments as item}
					<div class="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between transition-all duration-200">
						<div>
							<!-- Badges -->
							<div class="flex items-center justify-between gap-2 mb-3">
								<span class="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider {item.isTnaGap ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700' : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'}">
									{item.isTnaGap ? 'GAP Kompetensi' : item.course.category}
								</span>
								<span class="text-[11px] font-bold {item.status === 'COMPLETED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}">
									{item.status === 'COMPLETED' ? 'Selesai' : `Target: ${item.deadline || '-'}`}
								</span>
							</div>

							<!-- Title -->
							<h3 class="text-base font-black text-slate-900 dark:text-white mb-2 leading-snug line-clamp-2">
								{item.course.title}
							</h3>
							<p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
								{item.course.description}
							</p>

							<!-- Progress Bar -->
							<div class="space-y-1.5 mb-4">
								<div class="flex items-center justify-between text-[11px] font-bold">
									<span class="text-slate-600 dark:text-slate-300">
										{item.completedModulesCount} dari {item.totalModulesCount} Modul
									</span>
									<span class="text-indigo-600 dark:text-indigo-400">{item.progressPercent}%</span>
								</div>
								<div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
									<div 
										class="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
										style="width: {item.progressPercent}%"
									></div>
								</div>
								{#if item.score !== undefined}
									<p class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 text-right">
										Nilai Ujian: {item.score}/100
									</p>
								{/if}
							</div>

							<!-- Meta -->
							<div class="flex items-center gap-4 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-4">
								<div class="flex items-center gap-1">
									<span class="material-symbols-outlined text-sm text-indigo-600 dark:text-indigo-400">schedule</span>
									<span>{item.course.durationHours} Jam</span>
								</div>
								<div class="flex items-center gap-1">
									<span class="material-symbols-outlined text-sm text-indigo-600 dark:text-indigo-400">person</span>
									<span class="truncate max-w-[150px]">{item.course.instructor}</span>
								</div>
							</div>
						</div>

						<!-- Actions -->
						<div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
							{#if item.hasCertificate}
								<a 
									href="/certificates" 
									class="border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
								>
									<span class="material-symbols-outlined text-sm text-amber-500 dark:text-amber-400">workspace_premium</span>
									<span>Sertifikat</span>
								</a>
							{/if}

							<a 
								href="/courses/{item.courseId}" 
								class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98"
							>
								<span>{item.progressPercent === 100 ? 'Ulangi Materi' : (item.progressPercent > 0 ? 'Lanjutkan Belajar' : 'Mulai Belajar')}</span>
								<span class="material-symbols-outlined text-sm">arrow_forward</span>
							</a>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
