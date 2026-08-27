import { i as head, d as escape_html, b as attr_class, s as stringify, e as ensure_array_like, g as derived } from './dev-CRfXmnx1.js';
import './client-ILsMMsJR.js';
import './internal-BH882IRn.js';
import './index-DBqjc0Yf.js';

//#region src/routes/courses/[id]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const { course } = data;
		let activeModuleIndex = 0;
		let currentModule = derived(() => course.modules[activeModuleIndex] || course.modules[0]);
		let quizSubmitted = derived(() => form?.success ?? false);
		head("dq7btp", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(course.title)} | Player BCS Academy</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-6"><div class="flex items-center justify-between gap-4"><a href="/" class="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"><span class="material-symbols-outlined text-lg">arrow_back</span> <span>Kembali ke Beranda</span></a> <div class="flex items-center gap-2"><span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-800/50">${escape_html(course.category)}</span></div></div> <div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-4"><div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col"><div class="p-6 bg-slate-950 text-white min-h-[380px] flex flex-col justify-between">`);
		if (currentModule().type === "QUIZ") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="space-y-6"><div class="flex items-center gap-2.5 text-amber-400"><span class="material-symbols-outlined text-2xl">quiz</span> <h3 class="font-black text-lg">Evaluasi Akhir &amp; Post-Test Kelulusan</h3></div> <p class="text-xs text-slate-300 leading-relaxed">Jawab pertanyaan evaluasi di bawah ini untuk membuktikan pemahaman dan menerbitkan sertifikat digital resmi Anda.</p> `);
			if (form?.message) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div${attr_class(`p-4 rounded-2xl border text-center space-y-2 ${stringify(form.isPassed ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300" : "bg-rose-950/80 border-rose-500/50 text-rose-300")}`)}><span class="material-symbols-outlined text-3xl">${escape_html(form.isPassed ? "verified" : "cancel")}</span> <h4 class="font-black text-base">${escape_html(form.message)}</h4> `);
				if (form.isPassed) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<a href="/certificates" class="inline-block mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md">Buka &amp; Cetak Sertifikat</a>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (!quizSubmitted()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<form method="POST" action="?/submitQuiz" class="space-y-4"><div class="bg-slate-900 p-4 md:p-5 rounded-2xl border border-slate-800 space-y-3"><p class="text-xs md:text-sm font-bold text-white leading-relaxed">1. Apa tindakan prioritas pengemudi sebelum memulai perjalanan (Pemeriksaan P2H)?</p> <div class="space-y-2 text-xs"><label class="flex items-center gap-3 p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors border border-slate-700/50"><input type="radio" name="q1" value="A" required="" class="text-indigo-600 focus:ring-indigo-500"/> <span class="text-slate-200">A. Memeriksa tekanan ban, rem angin, level oli mesin, dan kelengkapan surat kendaraan</span></label> <label class="flex items-center gap-3 p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors border border-slate-700/50"><input type="radio" name="q1" value="B" required="" class="text-indigo-600 focus:ring-indigo-500"/> <span class="text-slate-200">B. Langsung memacu kendaraan dengan kecepatan maksimal di jalan tol</span></label></div></div> <div class="bg-slate-900 p-4 md:p-5 rounded-2xl border border-slate-800 space-y-3"><p class="text-xs md:text-sm font-bold text-white leading-relaxed">2. Jarak aman minimal antar truk muatan berat saat kondisi jalan basah/hujan adalah:</p> <div class="space-y-2 text-xs"><label class="flex items-center gap-3 p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors border border-slate-700/50"><input type="radio" name="q2" value="A" required="" class="text-indigo-600 focus:ring-indigo-500"/> <span class="text-slate-200">A. Minimal 50 - 100 meter (Aturan 4 Detik)</span></label> <label class="flex items-center gap-3 p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors border border-slate-700/50"><input type="radio" name="q2" value="B" required="" class="text-indigo-600 focus:ring-indigo-500"/> <span class="text-slate-200">B. Menempel sedekat mungkin untuk memotong hambatan angin</span></label></div></div> <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/30 transition-all cursor-pointer">Kirim Jawaban &amp; Selesaikan Modul</button></form>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="aspect-video w-full bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden"><div class="w-16 h-16 rounded-3xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse"><span class="material-symbols-outlined text-3xl">play_circle</span></div> <h4 class="font-black text-sm md:text-base text-white max-w-md">${escape_html(currentModule().title)}</h4> <p class="text-xs text-slate-400">Durasi: ${escape_html(currentModule().durationText)} • Format: ${escape_html(currentModule().type)}</p></div> <div class="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between gap-4"><span class="text-xs text-slate-400">Instruktur: ${escape_html(course.instructor)}</span> <div class="flex items-center gap-2">`);
			if (activeModuleIndex < course.modules.length - 1) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button type="button" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"><span>Bab Berikutnya</span> <span class="material-symbols-outlined text-sm">arrow_forward</span></button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]--></div> <div class="p-6 bg-slate-900 space-y-3"><h2 class="text-lg md:text-xl font-black text-white">${escape_html(course.title)}</h2> <p class="text-xs md:text-sm text-slate-400 leading-relaxed">${escape_html(course.description)}</p></div></div></div> <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 h-fit"><div><h3 class="text-sm font-black text-white uppercase tracking-wider">Silabus Bab Pembelajaran</h3> <p class="text-xs text-slate-400 mt-0.5">${escape_html(course.modules.length)} Bab • Total ${escape_html(course.durationHours)} Jam</p></div> <div class="space-y-2"><!--[-->`);
		const each_array = ensure_array_like(course.modules);
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let mod = each_array[i];
			const isSelected = activeModuleIndex === i;
			$$renderer.push(`<button type="button"${attr_class(`w-full text-left p-3.5 rounded-2xl transition-all flex items-center gap-3 cursor-pointer ${stringify(isSelected ? "bg-indigo-600 text-white shadow-md font-bold" : "bg-slate-800/60 hover:bg-slate-800 text-slate-300")}`)}><div${attr_class(`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${stringify(isSelected ? "bg-white/20 text-white" : "bg-slate-700 text-slate-400")}`)}>${escape_html(i + 1)}</div> <div class="flex-1 min-w-0"><p class="text-xs truncate">${escape_html(mod.title)}</p> <p class="text-[10px] opacity-70 mt-0.5">${escape_html(mod.durationText)} • ${escape_html(mod.type)}</p></div> `);
			if (mod.completed) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span${attr_class(`material-symbols-outlined text-base ${stringify(isSelected ? "text-white" : "text-emerald-400")}`)}>check_circle</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></button>`);
		}
		$$renderer.push(`<!--]--></div></div></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-6RQ_oViI.js.map
