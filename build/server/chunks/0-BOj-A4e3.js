import { d as decodeSession } from './auth-pcD1PfiB.js';
import 'postgres';

//#region src/routes/+layout.server.ts
var load = async ({ cookies, url }) => {
	const token = cookies.get("bcs_academy_token");
	let user = null;
	if (token) user = decodeSession(token);
	return {
		user,
		pathname: url.pathname
	};
};

var _layout_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 0;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-BaFNRHPp.js')).default;
const server_id = "src/routes/+layout.server.ts";
const imports = ["_app/immutable/nodes/0.BDIktSSg.js","_app/immutable/chunks/Ce3Kyutj.js","_app/immutable/chunks/cBdq8h7P.js","_app/immutable/chunks/v_jBEYI6.js"];
const stylesheets = ["_app/immutable/assets/0.BoR5b5BF.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=0-BOj-A4e3.js.map
