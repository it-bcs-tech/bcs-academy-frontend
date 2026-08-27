const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.DABXc1_b.js",app:"_app/immutable/entry/app.CUaj1DOr.js",imports:["_app/immutable/entry/start.DABXc1_b.js","_app/immutable/chunks/cBdq8h7P.js","_app/immutable/chunks/Ce3Kyutj.js","_app/immutable/entry/app.CUaj1DOr.js","_app/immutable/chunks/Ce3Kyutj.js","_app/immutable/chunks/DxLN9Q9A.js","_app/immutable/chunks/v_jBEYI6.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-BOj-A4e3.js')),
			__memo(() => import('./chunks/1-3dTLVZnC.js')),
			__memo(() => import('./chunks/2-DdL0-kW3.js')),
			__memo(() => import('./chunks/3-C2QRke5x.js')),
			__memo(() => import('./chunks/4-Br8UeT3N.js')),
			__memo(() => import('./chunks/5-B16AvZmn.js')),
			__memo(() => import('./chunks/6-DXMIm18_.js')),
			__memo(() => import('./chunks/7-Ci7p1b6L.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/catalog",
				pattern: /^\/catalog\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/certificates",
				pattern: /^\/certificates\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/courses/[id]",
				pattern: /^\/courses\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/profile",
				pattern: /^\/profile\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
