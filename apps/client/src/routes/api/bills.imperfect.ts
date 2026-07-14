import { createFileRoute } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { billCounterSchema } from "@/schemas/billCounter";

export const Route = createFileRoute("/api/bills/imperfect")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const parsed = billCounterSchema.safeParse(await request.json());
				if (!parsed.success) {
					return new Response(
						JSON.stringify({ error: parsed.error.flatten() }),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				try {
					const response = await api.bills.imperfect.post(parsed.data);

					if (response.error) {
						return new Response(JSON.stringify({ error: response.error }), {
							status: response.status || 500,
							headers: { "Content-Type": "application/json" },
						});
					}

					return new Response(JSON.stringify(response.data), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					return new Response(
						JSON.stringify({ error: `Failed to fetch: ${error}` }),
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
