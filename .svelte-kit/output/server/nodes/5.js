import * as server from '../entries/pages/courses/_id_/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/courses/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/courses/[id]/+page.server.ts";
export const imports = ["_app/immutable/nodes/5.Bl-y5HzI.js","_app/immutable/chunks/Ce3Kyutj.js","_app/immutable/chunks/M-3i9LdT.js","_app/immutable/chunks/cBdq8h7P.js","_app/immutable/chunks/v_jBEYI6.js"];
export const stylesheets = [];
export const fonts = [];
