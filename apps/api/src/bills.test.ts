import { describe, expect, test } from "bun:test";
import type { StackStats, SubtractionStackStats } from "pumpkin-tree-contracts";
import app from "./index";

const postBills = (path: "/bills/perfect" | "/bills/imperfect", body: object) =>
	app.handle(
		new Request(`http://localhost${path}`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify(body),
		}),
	);

describe("bills API", () => {
	test("POST /bills/perfect returns equal-value stacks when an exact split exists", async () => {
		const response = await postBills("/bills/perfect", {
			"5": 0,
			"10": 0,
			"20": 5,
			"50": 4,
			"100": 0,
		});

		expect(response.status).toBe(200);

		const stacks = (await response.json()) as StackStats[];
		expect(stacks).toHaveLength(3);
		expect(stacks.map((stack) => stack.value)).toEqual([100, 100, 100]);
		expect(
			stacks.reduce(
				(total, stack) =>
					total +
					Object.entries(stack.distribution).reduce(
						(stackTotal, [denomination, count]) =>
							stackTotal + Number.parseInt(denomination, 10) * count,
						0,
					),
				0,
			),
		).toBe(300);
	});

	test("POST /bills/imperfect only suggests removals that leave splittable stacks with allowed denominations", async () => {
		const response = await postBills("/bills/imperfect", {
			"5": 3,
			"10": 1,
			"20": 0,
			"50": 0,
			"100": 0,
			targetAmount: 5,
			allowedDenominations: {
				"5": true,
				"10": false,
				"20": true,
				"50": true,
				"100": true,
			},
		});

		expect(response.status).toBe(200);

		const suggestions = (await response.json()) as SubtractionStackStats[];
		expect(suggestions).toEqual([]);
	});

	test("POST /bills/imperfect handles large valid subtraction inputs", async () => {
		const response = await postBills("/bills/imperfect", {
			"5": 2,
			"10": 29,
			"20": 288,
			"50": 25,
			"100": 61,
			targetAmount: 120,
			allowedDenominations: {
				"5": true,
				"10": true,
				"20": true,
				"50": false,
				"100": false,
			},
		});

		expect(response.status).toBe(200);

		const suggestions = (await response.json()) as SubtractionStackStats[];
		expect(suggestions).toHaveLength(1);
		expect(suggestions[0].amountSubtracted).toBe(120);
		expect(suggestions[0].newTotal).toBe(13_290);
		expect(suggestions[0].combination).toEqual({ 20: 6 });
		expect(suggestions[0].stackStats.map((stack) => stack.value)).toEqual([
			4430, 4430, 4430,
		]);
		expect(suggestions[0].stackStats.map((stack) => stack.billCount)).toEqual([
			133, 133, 133,
		]);
	});
});
