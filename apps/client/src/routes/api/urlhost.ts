import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

const BASE_URL = env.VITE_API_URL;

export const Route = createFileRoute("/api/urlhost")({
	server: {
		handlers: {
			GET: async () => {
				return new Response(JSON.stringify({ apiHost: BASE_URL }), {});
			},
		},
	},
});
