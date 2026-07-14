export const DEFAULT_API_URL = "http://localhost:3000";

export function getApiBaseUrl(configuredUrl?: string): string {
	if (!configuredUrl) {
		return DEFAULT_API_URL;
	}

	try {
		return new URL(configuredUrl).toString();
	} catch {
		return DEFAULT_API_URL;
	}
}

export function resolveApiUrl(path: string, configuredUrl?: string): URL {
	return new URL(path, getApiBaseUrl(configuredUrl));
}
