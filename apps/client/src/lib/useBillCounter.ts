import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	billCounterSchema,
	type BillCounterFormData,
	type BillCounterResult,
} from "@/schemas/billCounter";

const DENOMINATIONS = [
	{ value: 100, label: "Hundreds", field: "100" as const },
	{ value: 50, label: "Fifties", field: "50" as const },
	{ value: 20, label: "Twenties", field: "20" as const },
	{ value: 10, label: "Tens", field: "10" as const },
	{ value: 5, label: "Fives", field: "5" as const },
];

export const useBillCounter = () => {
	const form = useForm<BillCounterFormData>({
		resolver: zodResolver(billCounterSchema),
		defaultValues: {
			5: 0,
			10: 0,
			20: 0,
			50: 0,
			100: 0,
			// default target amount is 0
			targetAmount: 0,
			// By default only 20s are allowed for subtraction
			allowedDenominations: {
				"5": false,
				"10": false,
				"20": true,
				"50": false,
				"100": false,
			},
		},
	});

	const calculateTotal = (data: BillCounterFormData): BillCounterResult => {
		const breakdown = DENOMINATIONS.map((denom) => ({
			denomination: denom.value,
			count: data[denom.field],
			subtotal: data[denom.field] * denom.value,
		}));

		const total = breakdown.reduce((sum, item) => sum + item.subtotal, 0);

		return { total, breakdown };
	};

	const resetForm = () => {
		form.reset({
			5: 0,
			10: 0,
			20: 0,
			50: 0,
			100: 0,
			targetAmount: 0,
			allowedDenominations: {
				"5": false,
				"10": false,
				"20": true,
				"50": false,
				"100": false,
			},
		});
	};

	return {
		form,
		calculateTotal,
		resetForm,
		denominations: DENOMINATIONS,
	};
};
