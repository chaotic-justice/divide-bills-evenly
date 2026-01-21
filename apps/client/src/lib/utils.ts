import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Deep equality check for primitives, arrays and plain objects.
 * Lightweight and sufficient for form value objects (numbers/strings/arrays/objects).
 */
export function deepEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;

	if (typeof a !== typeof b) return false;

	if (a && b && typeof a === "object") {
		if (Array.isArray(a) && Array.isArray(b)) {
			if (a.length !== b.length) return false;
			const bb = b as Array<unknown>;
			for (let i = 0; i < a.length; i++) {
				if (!deepEqual((a as Array<unknown>)[i], bb[i])) return false;
			}
			return true;
		}

		const aKeys = Object.keys(a as Record<string, unknown>);
		const bKeys = Object.keys(b as Record<string, unknown>);
		if (aKeys.length !== bKeys.length) return false;
		const bbObj = b as Record<string, unknown>;
		const aaObj = a as Record<string, unknown>;
		for (const key of aKeys) {
			if (!(key in bbObj)) return false;
			if (!deepEqual(aaObj[key], bbObj[key])) return false;
		}
		return true;
	}

	// Fallback (different primitives, functions, etc.)
	return false;
}
