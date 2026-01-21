import type { BillCounterFormData } from "@/schemas/billCounter";
import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

const BASE_URL = env.VITE_API_URL;

export const Route = createFileRoute("/api/bills/imperfect")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const data = (await request.json()) as BillCounterFormData;
				try {
					const response = await fetch(`${BASE_URL}/bills/imperfect`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(data),
					});
					const res = await response.json();

					return new Response(JSON.stringify(res), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					return new Response(
						JSON.stringify({ error: "Failed to fetch" + error }),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},
		},
	},
});
