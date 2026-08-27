<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const { user } = data;
</script>

<svelte:head>
	<title>Profil & Keamanan | BCS Academy</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
	<!-- HEADER -->
	<div>
		<h1 class="text-2xl font-black text-white tracking-tight">Profil & Pengaturan Akun</h1>
		<p class="text-xs text-slate-400 mt-0.5">Informasi data kepegawaian dan pengaturan keamanan PIN Anda.</p>
	</div>

	<!-- EMPLOYEE INFO CARD -->
	<div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
		<div class="flex items-center gap-4">
			<div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-500/20">
				{user?.name[0] || 'K'}
			</div>
			<div>
				<h2 class="text-lg font-black text-white">{user?.name}</h2>
				<p class="text-xs font-bold text-indigo-400">{user?.title || 'Staff Operasional'}</p>
				<p class="text-xs text-slate-400 mt-0.5">Divisi {user?.division} • ID: <span class="font-mono text-slate-300">{user?.payrollId}</span></p>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-4 py-4 border-y border-slate-800/80 text-xs">
			<div>
				<p class="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Nomor NIK / Payroll</p>
				<p class="font-mono font-black text-white mt-1">{user?.payrollId}</p>
			</div>
			<div>
				<p class="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Status Kepegawaian</p>
				<p class="font-bold text-emerald-400 mt-1 flex items-center gap-1">
					<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Aktif
				</p>
			</div>
		</div>
	</div>

	<!-- CHANGE PIN FORM -->
	<div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
		<div class="flex items-center gap-3">
			<span class="material-symbols-outlined text-indigo-400 text-2xl">lock_reset</span>
			<div>
				<h3 class="text-sm font-black text-white">Ganti PIN Keamanan</h3>
				<p class="text-xs text-slate-400">Ubah 6 digit PIN yang digunakan saat login ke BCS Academy.</p>
			</div>
		</div>

		{#if form?.message}
			<div class="p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 {form.success ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/50 border-rose-500/40 text-rose-300'}">
				<span class="material-symbols-outlined text-lg">{form.success ? 'check_circle' : 'error'}</span>
				<span>{form.message}</span>
			</div>
		{/if}

		<form method="POST" action="?/changePin" use:enhance class="space-y-4 pt-2">
			<div>
				<label for="oldPin" class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
					PIN Saat Ini (Lama)
				</label>
				<input 
					id="oldPin"
					type="password" 
					name="oldPin" 
					required 
					maxlength="6" 
					placeholder="Masukkan PIN lama" 
					class="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-2xl py-2.5 px-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono tracking-widest"
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="newPin" class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
						PIN Baru (6 Digit)
					</label>
					<input 
						id="newPin"
						type="password" 
						name="newPin" 
						required 
						maxlength="6" 
						placeholder="6 Digit angka" 
						class="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-2xl py-2.5 px-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono tracking-widest"
					/>
				</div>
				<div>
					<label for="confirmPin" class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
						Ulangi PIN Baru
					</label>
					<input 
						id="confirmPin"
						type="password" 
						name="confirmPin" 
						required 
						maxlength="6" 
						placeholder="Ulangi 6 digit" 
						class="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-2xl py-2.5 px-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono tracking-widest"
					/>
				</div>
			</div>

			<button 
				type="submit"
				class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer active:scale-98"
			>
				Simpan PIN Baru
			</button>
		</form>
	</div>

	<!-- LOGOUT BUTTON -->
	<form method="POST" action="/login?/logout" class="pt-2">
		<button 
			type="submit"
			class="w-full py-3.5 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 text-rose-300 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
		>
			<span class="material-symbols-outlined text-lg">logout</span>
			<span>Keluar dari Akun Academy</span>
		</button>
	</form>
</div>
