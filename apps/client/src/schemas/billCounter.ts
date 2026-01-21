import { z } from "zod";

export const billCounterSchema = z.object({
	"5": z.number().int().min(0, "Must be a positive number"),
	"10": z.number().int().min(0, "Must be a positive number"),
	"20": z.number().int().min(0, "Must be a positive number"),
	"50": z.number().int().min(0, "Must be a positive number"),
	"100": z.number().int().min(0, "Must be a positive number"),
	// Optional target amount to subtract in the imperfect algorithm.
	targetAmount: z
		.number()
		.min(0, "Target amount must be non-negative")
		.optional(),
	// Allowed denominations for subtraction; keys are denom strings and values indicate allowed.
	allowedDenominations: z
		.object({
			"5": z.boolean(),
			"10": z.boolean(),
			"20": z.boolean(),
			"50": z.boolean(),
			"100": z.boolean(),
		})
		.optional(),
});

export type BillCounterFormData = z.infer<typeof billCounterSchema>;

export interface BillCounterResult {
	total: number;
	breakdown: {
		denomination: number;
		count: number;
		subtotal: number;
	}[];
}
