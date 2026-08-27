import { e as ensure_array_like, a as attr, b as attr_class, s as stringify, c as store_get, d as escape_html, f as unsubscribe_stores, g as derived, h as getContext } from './dev-CRfXmnx1.js';
import './client-ILsMMsJR.js';
import './internal-BH882IRn.js';
import './index-DBqjc0Yf.js';

//#region node_modules/@sveltejs/kit/src/runtime/app/stores.js
/**
* A function that returns all of the contextual stores. On the server, this must be called during component initialization.
* Only use this if you need to defer store subscription until after the component has mounted, for some reason.
*
* @deprecated Use `$app/state` instead (requires Svelte 5, [see docs for more info](https://svelte.dev/docs/kit/migrating-to-sveltekit-2#SvelteKit-2.12:-$app-stores-deprecated))
*/
var getStores = () => {
	const stores$1 = getContext("__svelte__");
	return {
		page: { subscribe: stores$1.page.subscribe },
		navigating: { subscribe: stores$1.navigating.subscribe },
		updated: stores$1.updated
	};
};
/**
* A readable store whose value contains page data.
*
* On the server, this store can only be subscribed to during component initialization. In the browser, it can be subscribed to at any time.
*
* @deprecated Use `page` from `$app/state` instead (requires Svelte 5, [see docs for more info](https://svelte.dev/docs/kit/migrating-to-sveltekit-2#SvelteKit-2.12:-$app-stores-deprecated))
* @type {import('svelte/store').Readable<import('@sveltejs/kit').Page>}
*/
var page = { subscribe(fn) {
	return getStores().page.subscribe(fn);
} };
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data, children } = $$props;
		const user = derived(() => data.user);
		const isLoginPage = derived(() => store_get($$store_subs ??= {}, "$page", page).url.pathname === "/login");
		const navItems = [
			{
				href: "/",
				label: "Beranda",
				icon: "home"
			},
			{
				href: "/catalog",
				label: "Katalog",
				icon: "menu_book"
			},
			{
				href: "/certificates",
				label: "Sertifikat",
				icon: "workspace_premium"
			},
			{
				href: "/profile",
				label: "Profil",
				icon: "person"
			}
		];
		$$renderer.push(`<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">`);
		if (!isLoginPage()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<header class="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-4 md:px-8 py-3.5 shadow-md"><div class="max-w-6xl mx-auto flex items-center justify-between"><a href="/" class="flex items-center gap-3 group"><div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"><span class="material-symbols-outlined text-2xl">school</span></div> <div><div class="flex items-center gap-2"><span class="font-extrabold text-base md:text-lg tracking-tight text-white group-hover:text-indigo-400 transition-colors">BCS Academy</span> <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest hidden sm:inline-block">e-Learning</span></div> <p class="text-[11px] text-slate-400 font-medium">PT Buana Centra Swakarsa</p></div></a> <nav class="hidden md:flex items-center gap-1.5 bg-slate-800/60 p-1 rounded-2xl border border-slate-700/60"><!--[-->`);
			const each_array = ensure_array_like(navItems);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				$$renderer.push(`<a${attr("href", item.href)}${attr_class(`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === item.href ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-700/50")}`)}><span class="material-symbols-outlined text-lg">${escape_html(item.icon)}</span> <span>${escape_html(item.label)}</span></a>`);
			}
			$$renderer.push(`<!--]--></nav> <div class="flex items-center gap-3">`);
			if (user()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<a href="/profile" class="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-all"><div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-black text-xs">${escape_html(user().name[0] || "K")}</div> <div class="hidden lg:block text-left"><p class="text-xs font-bold text-white leading-tight truncate max-w-[130px]">${escape_html(user().name)}</p> <p class="text-[10px] text-slate-400 font-medium">${escape_html(user().payrollId)}</p></div></a> <form method="POST" action="/login?/logout" class="hidden sm:block"><button type="submit" title="Logout" class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 flex items-center justify-center transition-colors border border-slate-700/80"><span class="material-symbols-outlined text-lg">logout</span></button></form>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<a href="/login" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md">Masuk NIK</a>`);
			}
			$$renderer.push(`<!--]--></div></div></header>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <main${attr_class(`flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 ${stringify(isLoginPage() ? "p-0 flex items-center justify-center" : "pb-24 md:pb-12")}`)}>`);
		children($$renderer);
		$$renderer.push(`<!----></main> `);
		if (!isLoginPage()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<nav class="md:hidden fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/90 z-50 px-2 py-2 shadow-2xl flex items-center justify-around"><!--[-->`);
			const each_array_1 = ensure_array_like(navItems);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let item = each_array_1[$$index_1];
				const isActive = store_get($$store_subs ??= {}, "$page", page).url.pathname === item.href;
				$$renderer.push(`<a${attr("href", item.href)}${attr_class(`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${stringify(isActive ? "text-indigo-400 font-black scale-105" : "text-slate-400 hover:text-slate-200")}`)}><span${attr_class(`material-symbols-outlined text-2xl ${stringify(isActive ? "fill text-indigo-400" : "")}`)}>${escape_html(item.icon)}</span> <span class="text-[10px] font-bold mt-0.5">${escape_html(item.label)}</span></a>`);
			}
			$$renderer.push(`<!--]--></nav>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-BaFNRHPp.js.map
