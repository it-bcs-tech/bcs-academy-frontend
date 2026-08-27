<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { enrollments, user } = data;

	let filter = $state<'all' | 'in_progress' | 'completed'>('all');

	let filteredEnrollments = $derived(
		enrollments.filter((e) => {
			if (filter === 'in_progress') return e.status === 'IN_PROGRESS';
			if (filter === 'completed') return e.status === 'COMPLETED';
			return true;
		})
	);

	const inProgressCount = $derived(enrollments.filter((e) => e.status === 'IN_PROGRESS').length);
	const completedCount = $derived(enrollments.filter((e) => e.status === 'COMPLETED').length);
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
					<p class="text-xl font-black text-amber-400">1</p>
				</div>
			</div>
		</div>
	</div>

	<!-- FILTER & SECTION TITLE -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
		<div>
			<h2 class="text-lg font-black text-white tracking-tight">Kursus & Pelatihan Saya</h2>
			<p class="text-xs text-slate-400">Lanjutkan materi dan evaluasi kuis untuk mendapatkan sertifikasi.</p>
		</div>

		<!-- Segmented Filter -->
		<div class="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
			<button 
				type="button" 
				onclick={() => filter = 'all'} 
				class="px-3.5 py-1.5 rounded-xl transition-all cursor-pointer {filter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}"
			>
				Semua ({enrollments.length})
			</button>
			<button 
				type="button" 
				onclick={() => filter = 'in_progress'} 
				class="px-3.5 py-1.5 rounded-xl transition-all cursor-pointer {filter === 'in_progress' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}"
			>
				Sedang Berjalan ({inProgressCount})
			</button>
			<button 
				type="button" 
				onclick={() => filter = 'completed'} 
				class="px-3.5 py-1.5 rounded-xl transition-all cursor-pointer {filter === 'completed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}"
			>
				Selesai ({completedCount})
			</button>
		</div>
	</div>

	<!-- MY COURSES LIST -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
		{#each filteredEnrollments as item}
			<div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all duration-200">
				<div>
					<!-- Badges -->
					<div class="flex items-center justify-between gap-2 mb-3">
						<span class="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider {item.course.category === 'Operations' ? 'bg-blue-950 text-blue-300 border border-blue-800/40' : item.course.category === 'QHSE & Safety' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' : 'bg-purple-950 text-purple-300 border border-purple-800/40'}">
							{item.course.category}
						</span>

						{#if item.course.level === 'Mandatory'}
							<span class="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800/40 flex items-center gap-1">
								<span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
								Wajib K3
							</span>
						{/if}
					</div>

					<h3 class="font-black text-base text-white mb-2 leading-snug">
						{item.course.title}
					</h3>
					<p class="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
						{item.course.description}
					</p>

					<!-- Progress Bar -->
					<div class="space-y-1.5 mb-4">
						<div class="flex justify-between text-xs font-bold">
							<span class="text-slate-400">Progres Belajar</span>
							<span class="{item.progressPercent === 100 ? 'text-emerald-400 font-black' : 'text-indigo-400'}">
								{item.progressPercent}% ({item.completedModulesCount}/{item.totalModulesCount} Bab)
							</span>
						</div>
						<div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
							<div 
								class="h-full rounded-full transition-all duration-500 {item.progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}" 
								style="width: {item.progressPercent}%"
							></div>
						</div>
					</div>

					<!-- Meta -->
					<div class="flex items-center gap-4 text-[11px] font-semibold text-slate-400 mb-4">
						<div class="flex items-center gap-1">
							<span class="material-symbols-outlined text-sm text-indigo-400">schedule</span>
							<span>{item.course.durationHours} Jam</span>
						</div>
						<div class="flex items-center gap-1">
							<span class="material-symbols-outlined text-sm text-indigo-400">person</span>
							<span class="truncate max-w-[150px]">{item.course.instructor}</span>
						</div>
					</div>
				</div>

				<!-- Actions -->
				<div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
					{#if item.hasCertificate}
						<a 
							href="/certificates" 
							class="border border-amber-500/40 bg-amber-950/20 text-amber-300 hover:bg-amber-950/40 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
						>
							<span class="material-symbols-outlined text-sm text-amber-400">workspace_premium</span>
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
</div>
