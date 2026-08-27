import { C as COURSES_CATALOG } from './mockData-DkkROE01.js';
import { r as redirect } from './index-CRFfcpCQ.js';
import './index-DBqjc0Yf.js';

//#region src/routes/catalog/+page.server.ts
var load = async ({ parent }) => {
	const { user } = await parent();
	if (!user) throw redirect(303, "/login");
	return { catalog: COURSES_CATALOG };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 3;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-tCbdIajU.js')).default;
const server_id = "src/routes/catalog/+page.server.ts";
const imports = ["_app/immutable/nodes/3.Bu7ipzhH.js","_app/immutable/chunks/Ce3Kyutj.js","_app/immutable/chunks/v_jBEYI6.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=3-C2QRke5x.js.map
