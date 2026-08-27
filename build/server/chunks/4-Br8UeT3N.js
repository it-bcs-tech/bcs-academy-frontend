import { M as MOCK_CERTIFICATES } from './mockData-DkkROE01.js';
import { r as redirect } from './index-CRFfcpCQ.js';
import './index-DBqjc0Yf.js';

//#region src/routes/certificates/+page.server.ts
var load = async ({ parent }) => {
	const { user } = await parent();
	if (!user) throw redirect(303, "/login");
	return { certificates: MOCK_CERTIFICATES };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 4;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DkAywnfS.js')).default;
const server_id = "src/routes/certificates/+page.server.ts";
const imports = ["_app/immutable/nodes/4.aVgytmqC.js","_app/immutable/chunks/Ce3Kyutj.js","_app/immutable/chunks/v_jBEYI6.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=4-Br8UeT3N.js.map
