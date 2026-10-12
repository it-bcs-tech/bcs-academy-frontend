<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.status} | BCS Academy</title>
</svelte:head>

<div class="min-h-[60vh] flex items-center justify-center p-4">
	<div class="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-lg">
		<div class="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
			<span class="material-symbols-outlined text-4xl">
				{$page.status === 403 ? 'lock' : $page.status === 404 ? 'search_off' : 'error'}
			</span>
		</div>

		<div class="space-y-2">
			<span class="inline-block px-3 py-1 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
				Status {$page.status}
			</span>
			<h1 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">
				{$page.status === 403 ? 'Akses Ditolak' : $page.status === 404 ? 'Halaman Tidak Ditemukan' : 'Terjadi Kesalahan'}
			</h1>
			<p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
				{$page.error?.message || 'Maaf, terjadi kendala saat memproses permintaan Anda.'}
			</p>
		</div>

		<div class="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
			<a 
				href="/" 
				class="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
			>
				<span class="material-symbols-outlined text-sm">home</span>
				<span>Kembali ke Beranda</span>
			</a>
			<a 
				href="/catalog" 
				class="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
			>
				<span class="material-symbols-outlined text-sm">menu_book</span>
				<span>Katalog Pelatihan</span>
			</a>
		</div>
	</div>
</div>
