import { n as decodeSession } from "../../chunks/auth.js";
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
//#endregion
export { load };
