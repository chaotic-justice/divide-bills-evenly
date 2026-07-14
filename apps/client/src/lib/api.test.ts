import { describe, expect, it } from "vitest";
import { resolveApiUrl } from "./api-url";

describe("resolveApiUrl", () => {
	it("uses a valid absolute API URL when the Worker env binding is missing", () => {
		expect(resolveApiUrl("/bills/perfect").toString()).toBe(
			"http://localhost:3000/bills/perfect",
		);
	});

	it("uses the configured absolute API URL when present", () => {
		expect(
			resolveApiUrl("/bills/perfect", "http://localhost:3000").toString(),
		).toBe("http://localhost:3000/bills/perfect");
	});
});
