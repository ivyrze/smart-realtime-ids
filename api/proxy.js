import { endpoints } from "../src/endpoints.js";

export const GET = async req => {
	const params = Object.fromEntries(
		(new URL(req.url)).searchParams.entries()
	);
	let { agency, routeIds } = params;

	const endpoint = endpoints[agency];
	if (!endpoint?.proxy) {
		return new Response({ status: 400 });
	}

	const response = await fetch(endpoint.url(routeIds));
	return response;
};