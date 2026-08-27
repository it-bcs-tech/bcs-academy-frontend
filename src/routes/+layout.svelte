<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { data, children } = $props();
	const user = $derived(data.user);
	const isLoginPage = $derived($page.url.pathname === '/login');

	const navItems = [
		{ href: '/', label: 'Beranda', icon: 'home' },
		{ href: '/catalog', label: 'Katalog', icon: 'menu_book' },
		{ href: '/certificates', label: 'Sertifikat', icon: 'workspace_premium' },
		{ href: '/profile', label: 'Profil', icon: 'person' }
	];
</script>

<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
	{#if !isLoginPage}
		<!-- TOP HEADER (All Devices) -->
		<header class="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-4 md:px-8 py-3.5 shadow-md">
			<div class="max-w-6xl mx-auto flex items-center justify-between">
				<!-- Brand -->
				<a href="/" class="flex items-center gap-3 group">
					<div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
						<span class="material-symbols-outlined text-2xl">school</span>
					</div>
					<div>
						<div class="flex items-center gap-2">
							<span class="font-extrabold text-base md:text-lg tracking-tight text-white group-hover:text-indigo-400 transition-colors">
								BCS Academy
							</span>
							<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest hidden sm:inline-block">
								e-Learning
							</span>
						</div>
						<p class="text-[11px] text-slate-400 font-medium">PT Buana Centra Swakarsa</p>
					</div>
				</a>

				<!-- Desktop / Tablet Nav Links -->
				<nav class="hidden md:flex items-center gap-1.5 bg-slate-800/60 p-1 rounded-2xl border border-slate-700/60">
					{#each navItems as item}
						<a 
							href={item.href}
							class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 {$page.url.pathname === item.href ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}"
						>
							<span class="material-symbols-outlined text-lg">{item.icon}</span>
							<span>{item.label}</span>
						</a>
					{/each}
				</nav>

				<!-- User Profile & Action -->
				<div class="flex items-center gap-3">
					{#if user}
						<a href="/profile" class="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-all">
							<div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-black text-xs">
								{user.name[0] || 'K'}
							</div>
							<div class="hidden lg:block text-left">
								<p class="text-xs font-bold text-white leading-tight truncate max-w-[130px]">{user.name}</p>
								<p class="text-[10px] text-slate-400 font-medium">{user.payrollId}</p>
							</div>
						</a>

						<form method="POST" action="/login?/logout" class="hidden sm:block">
							<button type="submit" title="Logout" class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 flex items-center justify-center transition-colors border border-slate-700/80">
								<span class="material-symbols-outlined text-lg">logout</span>
							</button>
						</form>
					{:else}
						<a href="/login" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md">
							Masuk NIK
						</a>
					{/if}
				</div>
			</div>
		</header>
	{/if}

	<!-- MAIN CONTENT CANVAS -->
	<main class="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 {isLoginPage ? 'p-0 flex items-center justify-center' : 'pb-24 md:pb-12'}">
		{@render children()}
	</main>

	{#if !isLoginPage}
		<!-- MOBILE BOTTOM NAVIGATION (Smartphones Only) -->
		<nav class="md:hidden fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/90 z-50 px-2 py-2 shadow-2xl flex items-center justify-around">
			{#each navItems as item}
				{@const isActive = $page.url.pathname === item.href}
				<a 
					href={item.href}
					class="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all {isActive ? 'text-indigo-400 font-black scale-105' : 'text-slate-400 hover:text-slate-200'}"
				>
					<span class="material-symbols-outlined text-2xl {isActive ? 'fill text-indigo-400' : ''}">{item.icon}</span>
					<span class="text-[10px] font-bold mt-0.5">{item.label}</span>
				</a>
			{/each}
		</nav>
	{/if}
</div>
