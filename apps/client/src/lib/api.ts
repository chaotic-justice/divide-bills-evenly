import { env } from "cloudflare:workers";
import type {
	BillCounterFormData,
	StackStats,
	SubtractionStackStats,
} from "pumpkin-tree-contracts";
import { resolveApiUrl as resolveApiUrlWithBase } from "./api-url";

type ApiResult<T> = Readonly<{
	data: T | null;
	error: string | null;
	status: number;
}>;

export function resolveApiUrl(path: string): URL {
	return resolveApiUrlWithBase(path, env.VITE_API_URL);
}

async function postJson<T>(
	path: string,
	body: BillCounterFormData,
): Promise<ApiResult<T>> {
	try {
		const response = await fetch(resolveApiUrl(path), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		const text = await response.text();
		const parsed = text.length > 0 ? JSON.parse(text) : null;

		if (!response.ok) {
			const error =
				parsed && typeof parsed === "object" && "error" in parsed
					? String((parsed as { error: unknown }).error)
					: response.statusText || "Request failed";

			return {
				data: null,
				error,
				status: response.status,
			};
		}

		return {
			data: parsed as T,
			error: null,
			status: response.status,
		};
	} catch (error) {
		return {
			data: null,
			error: error instanceof Error ? error.message : String(error),
			status: 500,
		};
	}
}

export const api = {
	bills: {
		perfect: {
			post: (data: BillCounterFormData) =>
				postJson<StackStats[]>("/bills/perfect", data),
		},
		imperfect: {
			post: (data: BillCounterFormData) =>
				postJson<SubtractionStackStats[]>("/bills/imperfect", data),
		},
	},
} as const;
