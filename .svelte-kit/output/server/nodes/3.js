import * as server from '../entries/pages/catalog/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/catalog/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/catalog/+page.server.ts";
export const imports = ["_app/immutable/nodes/3.Bu7ipzhH.js","_app/immutable/chunks/Ce3Kyutj.js","_app/immutable/chunks/v_jBEYI6.js"];
export const stylesheets = [];
export const fonts = [];
