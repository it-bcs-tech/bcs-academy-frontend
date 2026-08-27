import { B as attr, V as escape_html, a as ensure_array_like, i as derived, l as stringify, n as attr_class, o as head } from "../../../chunks/dev.js";
//#region src/routes/catalog/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const { catalog } = data;
		let searchQuery = "";
		let selectedCategory = "All";
		const categories = [
			"All",
			"Operations",
			"QHSE & Safety",
			"Technical",
			"Digital Systems",
			"Leadership"
		];
		let filteredCatalog = derived(() => catalog.filter((c) => {
			if (!(selectedCategory === "All" || c.category === selectedCategory)) return false;
			if (!searchQuery.trim()) return true;
			const q = searchQuery.toLowerCase();
			return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q));
		}));
		head("ec29qo", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Katalog Kursus | BCS Academy</title>`);
			});
		});
		$$renderer.push(`<div class="space-y-6"><div class="flex flex-col md:flex-row md:items-end justify-between gap-4"><div><h1 class="text-2xl font-black text-white tracking-tight">Katalog Pembelajaran Digital</h1> <p class="text-xs text-slate-400 mt-0.5">Eksplorasi modul pelatihan standar industri logistik, sertifikasi K3, dan teknis operasional.</p></div> <div class="relative w-full md:w-72"><span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span> <input type="text"${attr("value", searchQuery)} placeholder="Cari materi, instruktur..." class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"/></div></div> <div class="flex items-center gap-2 overflow-x-auto pb-1"><!--[-->`);
		const each_array = ensure_array_like(categories);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let cat = each_array[$$index];
			$$renderer.push(`<button type="button"${attr_class(`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${stringify(selectedCategory === cat ? "bg-indigo-600 text-white shadow-md" : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white")}`)}>${escape_html(cat)}</button>`);
		}
		$$renderer.push(`<!--]--></div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><!--[-->`);
		const each_array_1 = ensure_array_like(filteredCatalog());
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let course = each_array_1[$$index_1];
			$$renderer.push(`<div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-700 hover:shadow-lg transition-all duration-200 group"><div><div class="flex items-center justify-between mb-3"><span${attr_class(`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${stringify(course.category === "Operations" ? "bg-blue-950 text-blue-300 border border-blue-800/40" : course.category === "QHSE & Safety" ? "bg-emerald-950 text-emerald-300 border border-emerald-800/40" : "bg-purple-950 text-purple-300 border border-purple-800/40")}`)}>${escape_html(course.category)}</span> <span class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400"><span class="material-symbols-outlined text-sm fill">star</span> ${escape_html(course.rating)}</span></div> <h3 class="font-black text-base text-white group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">${escape_html(course.title)}</h3> <p class="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">${escape_html(course.description)}</p> <div class="grid grid-cols-3 gap-2 py-3 px-3.5 bg-slate-950/60 rounded-2xl text-[11px] font-semibold text-slate-400 mb-4 border border-slate-800/60"><div class="flex items-center gap-1"><span class="material-symbols-outlined text-sm text-indigo-400">schedule</span> <span>${escape_html(course.durationHours)} Jam</span></div> <div class="flex items-center gap-1"><span class="material-symbols-outlined text-sm text-indigo-400">layers</span> <span>${escape_html(course.modulesCount)} Bab</span></div> <div class="flex items-center gap-1"><span class="material-symbols-outlined text-sm text-indigo-400">group</span> <span>${escape_html(course.enrolledCount)} Siswa</span></div></div></div> <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-black text-xs flex items-center justify-center">${escape_html(course.instructor[0])}</div> <span class="text-[11px] font-bold text-slate-300 truncate max-w-[120px]">${escape_html(course.instructor)}</span></div> <a${attr("href", `/courses/${stringify(course.id)}`)} class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95"><span>Buka Materi</span> <span class="material-symbols-outlined text-sm">play_arrow</span></a></div></div>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
	});
}
//#endregion
export { _page as default };
