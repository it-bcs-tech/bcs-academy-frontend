import { i as head, d as escape_html, a as attr } from './dev-CRfXmnx1.js';
import './client-ILsMMsJR.js';
import './internal-BH882IRn.js';
import './index-DBqjc0Yf.js';

//#region src/routes/login/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { form } = $$props;
		let quickPayrollId = "";
		let quickPin = "123456";
		head("1x05zx6", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Masuk | BCS Academy e-Learning</title>`);
			});
		});
		$$renderer.push(`<div class="w-full min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden"><div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div> <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div> <div class="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6"><div class="text-center space-y-2"><div class="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20"><span class="material-symbols-outlined text-3xl">school</span></div> <h1 class="text-2xl font-black text-white tracking-tight">BCS Academy</h1> <p class="text-xs text-slate-400 font-medium max-w-xs mx-auto">Portal Pelatihan &amp; Sertifikasi Mandiri Karyawan PT Buana Centra Swakarsa</p></div> `);
		if (form?.message) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2.5"><span class="material-symbols-outlined text-lg text-rose-400">error</span> <span>${escape_html(form.message)}</span></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <form method="POST" action="?/login" class="space-y-4"><div><label for="payrollId" class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">NIK / Payroll ID Karyawan</label> <div class="relative"><span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg">badge</span> <input id="payrollId" type="text" name="payrollId"${attr("value", quickPayrollId)} required="" placeholder="Contoh: EMP-0042 atau NIK" class="w-full bg-slate-800/80 border border-slate-700 focus:border-indigo-500 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium uppercase"/></div></div> <div><label for="pin" class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">PIN Keamanan (6 Digit)</label> <div class="relative"><span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg">lock</span> <input id="pin" type="password" name="pin"${attr("value", quickPin)} required="" maxlength="6" placeholder="Default: 123456" class="w-full bg-slate-800/80 border border-slate-700 focus:border-indigo-500 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium tracking-widest"/></div></div> <button type="submit" class="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2 mt-2"><span>Masuk ke Academy</span> <span class="material-symbols-outlined text-lg">arrow_forward</span></button></form> <div class="pt-4 border-t border-slate-800 space-y-2.5"><p class="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Akses Cepat Pengujian:</p> <div class="grid grid-cols-3 gap-2"><button type="button" class="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-center text-slate-300 hover:text-white transition-all cursor-pointer"><p class="text-[10px] font-bold">Driver Truk</p> <p class="text-[9px] text-indigo-400 font-mono">EMP-0042</p></button> <button type="button" class="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-center text-slate-300 hover:text-white transition-all cursor-pointer"><p class="text-[10px] font-bold">Mekanik</p> <p class="text-[9px] text-indigo-400 font-mono">EMP-0018</p></button> <button type="button" class="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-center text-slate-300 hover:text-white transition-all cursor-pointer"><p class="text-[10px] font-bold">Officer K3</p> <p class="text-[9px] text-indigo-400 font-mono">EMP-0099</p></button></div></div></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CjkkEzwU.js.map
