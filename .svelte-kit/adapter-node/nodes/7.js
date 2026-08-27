import * as server from '../entries/pages/profile/_page.server.ts.js';

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/profile/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/profile/+page.server.ts";
export const imports = ["_app/immutable/nodes/7.DN_jFHZl.js","_app/immutable/chunks/Ce3Kyutj.js","_app/immutable/chunks/M-3i9LdT.js","_app/immutable/chunks/cBdq8h7P.js","_app/immutable/chunks/v_jBEYI6.js"];
export const stylesheets = [];
export const fonts = [];
