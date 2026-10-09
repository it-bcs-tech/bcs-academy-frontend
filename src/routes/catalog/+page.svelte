<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { catalog } = data;

	let searchQuery = $state('');
	let selectedCategory = $state('All');
	const categories = ['All', 'Operations', 'QHSE & Safety', 'Technical', 'Digital Systems', 'Leadership'];

	let filteredCatalog = $derived(
		catalog.filter((c) => {
			const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
			if (!matchesCategory) return false;
			if (!searchQuery.trim()) return true;
			const q = searchQuery.toLowerCase();
			return (
				c.title.toLowerCase().includes(q) ||
				c.description.toLowerCase().includes(q) ||
				c.instructor.toLowerCase().includes(q) ||
				c.tags.some((t) => t.toLowerCase().includes(q))
			);
		})
	);
</script>

<svelte:head>
	<title>Katalog Kursus | BCS Academy</title>
</svelte:head>

<div class="space-y-6">
	<!-- HEADER & SEARCH BAR -->
	<div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
		<div>
			<h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Katalog Pembelajaran Digital</h1>
			<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
				Eksplorasi modul pelatihan standar industri logistik, sertifikasi K3, dan teknis operasional.
			</p>
		</div>

		<!-- Search Input -->
		<div class="relative w-full md:w-72">
			<span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg">search</span>
			<input 
				type="text" 
				bind:value={searchQuery} 
				placeholder="Cari materi, instruktur..." 
				class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
			/>
		</div>
	</div>

	<!-- CATEGORY FILTER PILLS -->
	<div class="flex items-center gap-2 overflow-x-auto pb-1">
		{#each categories as cat}
			<button 
				type="button" 
				onclick={() => selectedCategory = cat} 
				class="px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer {selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-xs'}"
			>
				{cat}
			</button>
		{/each}
	</div>

	<!-- CATALOG GRID -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each filteredCatalog as course}
			<div class="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all duration-200 group flex flex-col justify-between">
				<div>
					<!-- Header Tag & Rating -->
					<div class="flex items-center justify-between mb-3">
						<span class="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider {course.category === 'Operations' ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800/40' : course.category === 'QHSE & Safety' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/40' : 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800/40'}">
							{course.category}
						</span>
						<span class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 dark:text-amber-400">
							<span class="material-symbols-outlined text-sm fill">star</span>
							{course.rating}
						</span>
					</div>

					<h3 class="font-black text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
						{course.title}
					</h3>
					<p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
						{course.description}
					</p>

					<!-- Meta -->
					<div class="grid grid-cols-3 gap-2 py-3 px-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-4 border border-slate-100 dark:border-slate-800/60">
						<div class="flex items-center gap-1">
							<span class="material-symbols-outlined text-sm text-indigo-600 dark:text-indigo-400">schedule</span>
							<span>{course.durationHours} Jam</span>
						</div>
						<div class="flex items-center gap-1">
							<span class="material-symbols-outlined text-sm text-indigo-600 dark:text-indigo-400">layers</span>
							<span>{course.modulesCount} Bab</span>
						</div>
						<div class="flex items-center gap-1">
							<span class="material-symbols-outlined text-sm text-indigo-600 dark:text-indigo-400">group</span>
							<span>{course.enrolledCount} Siswa</span>
						</div>
					</div>
				</div>

				<div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
					<div class="flex items-center gap-2">
						<div class="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 font-black text-xs flex items-center justify-center">
							{course.instructor[0]}
						</div>
						<span class="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{course.instructor}</span>
					</div>

					<a 
						href="/courses/{course.id}" 
						class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95"
					>
						<span>Buka Materi</span>
						<span class="material-symbols-outlined text-sm">play_arrow</span>
					</a>
				</div>
			</div>
		{/each}
	</div>
</div>
