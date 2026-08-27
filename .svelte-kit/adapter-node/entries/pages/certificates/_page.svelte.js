import { V as escape_html, a as ensure_array_like, l as stringify, n as attr_class, o as head } from "../../../chunks/dev.js";
//#region src/routes/certificates/+page.svelte
function _page($$renderer, $$props) {
	let { data } = $$props;
	const { certificates, user } = data;
	let selectedCert = certificates[0] || null;
	head("gbdbmt", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Sertifikat Digital Saya | BCS Academy</title>`);
		});
	});
	$$renderer.push(`<div class="space-y-6"><div class="flex flex-col md:flex-row md:items-end justify-between gap-4"><div><h1 class="text-2xl font-black text-white tracking-tight">Sertifikat Kelulusan Resmi</h1> <p class="text-xs text-slate-400 mt-0.5">Daftar sertifikat kompetensi &amp; pelatihan keselamatan kerja terverifikasi PT BCS Logistics.</p></div></div> `);
	if (certificates.length === 0) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3"><span class="material-symbols-outlined text-4xl text-slate-600">workspace_premium</span> <h3 class="font-bold text-slate-300 text-sm">Belum Ada Sertifikat yang Diterbitkan</h3> <p class="text-xs text-slate-500 max-w-sm mx-auto">Selesaikan seluruh bab dan post-test kuis pada modul yang di-assign untuk menerbitkan sertifikat resmi.</p> <a href="/catalog" class="inline-block mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md">Buka Katalog Kursus</a></div>`);
	} else {
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="space-y-3"><!--[-->`);
		const each_array = ensure_array_like(certificates);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let cert = each_array[$$index];
			const isSelected = selectedCert?.certificateNumber === cert.certificateNumber;
			$$renderer.push(`<button type="button"${attr_class(`w-full text-left p-4 rounded-3xl transition-all border cursor-pointer ${stringify(isSelected ? "bg-indigo-950/60 border-indigo-500/60 shadow-lg" : "bg-slate-900 border-slate-800 hover:border-slate-700")}`)}><div class="flex items-center gap-3 mb-2"><span${attr_class(`material-symbols-outlined text-2xl ${stringify(isSelected ? "text-amber-400" : "text-slate-500")}`)}>workspace_premium</span> <span class="text-[10px] font-black uppercase tracking-wider text-indigo-400">${escape_html(cert.category)}</span></div> <h3 class="font-bold text-sm text-white line-clamp-2 mb-2">${escape_html(cert.courseTitle)}</h3> <div class="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-800/80"><span class="font-mono">${escape_html(cert.certificateNumber)}</span> <span class="text-emerald-400 font-bold">Skor: ${escape_html(cert.score)}</span></div></button>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (selectedCert) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="lg:col-span-2 space-y-4"><div class="bg-white text-slate-900 rounded-3xl p-8 md:p-12 border-8 border-slate-100 shadow-2xl relative overflow-hidden text-center space-y-6"><div class="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-amber-500/40 rounded-tl-2xl pointer-events-none"></div> <div class="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-amber-500/40 rounded-br-2xl pointer-events-none"></div> <div class="space-y-1"><span class="text-xs font-black uppercase tracking-[0.25em] text-amber-600 block">PT BUANA CENTRA SWAKARSA</span> <h2 class="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">SERTIFIKAT KELULUSAN</h2> <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">BCS Academy Certification Program</p></div> <div class="py-4 space-y-2"><p class="text-xs text-slate-500 uppercase tracking-widest font-medium">Diberikan Dengan Bangga Kepada:</p> <h3 class="text-2xl md:text-3xl font-black text-indigo-950 tracking-tight underline decoration-amber-400 decoration-2 underline-offset-8">${escape_html(user?.name || selectedCert.employeeName)}</h3> <p class="text-xs text-slate-600 font-bold mt-1">NIK: ${escape_html(user?.payrollId || selectedCert.payrollId)} • Divisi: ${escape_html(user?.division || "OPERASIONAL")}</p></div> <div class="space-y-2 max-w-lg mx-auto"><p class="text-xs text-slate-600 leading-relaxed">Atas keberhasilan menyelesaikan seluruh silabus pelatihan, simulasi praktik, dan evaluasi post-test kelulusan pada program kompetensi:</p> <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl"><h4 class="font-extrabold text-base text-slate-900">${escape_html(selectedCert.courseTitle)}</h4> <p class="text-[11px] text-slate-500 mt-0.5">Kategori: ${escape_html(selectedCert.category)} • Nilai Evaluasi: <strong class="text-emerald-600">${escape_html(selectedCert.score)}/100</strong></p></div></div> <div class="pt-6 border-t border-slate-200 grid grid-cols-2 gap-6 text-left items-end"><div><p class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">No. Sertifikat Digital:</p> <p class="font-mono text-xs font-black text-slate-800">${escape_html(selectedCert.certificateNumber)}</p> <p class="text-[10px] text-slate-500 mt-1">Diterbitkan: ${escape_html(selectedCert.issuedAt)}</p></div> <div class="text-right space-y-1"><div class="inline-block p-2 bg-slate-50 rounded-xl border border-slate-200"><span class="material-symbols-outlined text-2xl text-emerald-600">verified_user</span></div> <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Terdaftar Resmi di Sistem HRIS</p></div></div></div> <div class="flex justify-end gap-3"><button type="button" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"><span class="material-symbols-outlined text-base">print</span> <span>Cetak / Unduh PDF Sertifikat</span></button></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	}
	$$renderer.push(`<!--]--></div>`);
}
//#endregion
export { _page as default };
