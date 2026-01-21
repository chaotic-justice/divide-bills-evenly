import type { BillCounterFormData } from "@/schemas/billCounter";
import type { StackStats, SubtractionStackStats } from "@/types/api";

// Generic fetch wrapper with proper error handling that accepts a base URL.
async function apiClient<T>(
	baseUrl: string,
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	const response = await fetch(`${baseUrl}${endpoint}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			// Add auth headers if needed
			// 'Authorization': `Bearer ${token}`,
			...options.headers,
		},
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({
			message: `HTTP error! status: ${response.status}`,
		}));
		// @ts-expect-error
		throw new Error(error.message || "Request failed");
	}

	// Handle empty responses (204 No Content)
	if (response.status === 204) {
		return {} as T;
	}

	return response.json() as Promise<T>;
}

// Factory that creates an api client bound to a specific base URL.
export function createApi(baseUrl: string) {
	return {
		billsPerfect: (data: BillCounterFormData) =>
			apiClient<StackStats[]>(baseUrl, "/bills/perfect", {
				method: "POST",
				body: JSON.stringify(data),
			}),
		billsImperfect: (data: BillCounterFormData) =>
			apiClient<SubtractionStackStats[]>(baseUrl, "/bills/imperfect", {
				method: "POST",
				body: JSON.stringify(data),
			}),
	};
}
