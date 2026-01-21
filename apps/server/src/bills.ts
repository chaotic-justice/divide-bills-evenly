import Elysia, { t } from "elysia";
import {
	type Bills,
	computeStackStats,
	parseBills,
	optimizeBillSubtraction,
	applySubtractionOptions,
	distributeBills,
	removeBillsToReachAmount,
	type SubtractionStackStats,
} from "./utils/bill-logic";

const BillsBase = t.Object({
	"5": t.Number({ minimum: 0 }),
	"10": t.Number({ minimum: 0 }),
	"20": t.Number({ minimum: 0 }),
	"50": t.Number({ minimum: 0 }),
	"100": t.Number({ minimum: 0 }),
	targetAmount: t.Optional(t.Number({ minimum: 0 })),
	allowedDenominations: t.Optional(t.Record(t.String(), t.Boolean())),
});

export const bills = new Elysia({
	prefix: "/bills",
})
	.onTransform(function log({ body, params, path, request: { method } }) {
		console.log(`${method} ${path}`, {
			body,
			params,
		});
	})
	.guard({
		body: BillsBase,
	})
	.post("/perfect", ({ body }) => {
		let [billCounts] = parseBills(body);

		// If targetAmount is provided, subtract it first
		if (body.targetAmount !== undefined && body.targetAmount > 0) {
			billCounts = removeBillsToReachAmount(
				{ ...billCounts },
				body.targetAmount,
				null,
				undefined, // Always use all denominations
			);
		}

		const distributedStacks = distributeBills(billCounts);
		const stackStatistics = computeStackStats(distributedStacks);
		return stackStatistics;
	})
	/*
    {"5": 6,
    "10": 6,
    "20": 4,
    "50": 0,
    "100": 1} */
	.post("/imperfect", ({ body, set }) => {
		const [billCounts, total] = parseBills(body);

		try {
			const optionDetails = optimizeBillSubtraction(
				total,
				billCounts,
				body.targetAmount,
				body.allowedDenominations,
			);

			const res = optionDetails.reduce(
				(acc: SubtractionStackStats[], option) => {
					const billsCopy: Bills = Object.fromEntries(
						Object.entries(billCounts).map(([denom, count]) => [denom, count]),
					);
					const { newTotal: desiredTotal, combination: selectedCombination } =
						option;
					const { remainingBills: billsAfterRemoval } = applySubtractionOptions(
						desiredTotal,
						selectedCombination,
						billsCopy,
						body.allowedDenominations,
					);
					const distributedStacks = distributeBills(billsAfterRemoval);
					const stackStats = computeStackStats(distributedStacks);
					acc = acc.concat({
						...option,
						stackStats,
					});
					return acc;
				},
				[],
			);

			return res;
		} catch (e: unknown) {
			set.status = 400;
			return e instanceof Error ? e.message : "Unknown error";
		}
	});
