import type { BillCounterFormData } from "@/schemas/billCounter";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "@/lib/api";

export const Route = createFileRoute("/api/bills/imperfect")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const data = (await request.json()) as BillCounterFormData;
				try {
					const response = await api.bills.imperfect.post(data);
					
					if (response.error) {
						return new Response(
							JSON.stringify({ error: response.error }),
							{
								status: response.status || 500,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					return new Response(JSON.stringify(response.data), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					return new Response(
						JSON.stringify({ error: "Failed to fetch: " + error }),
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
