import { createFileRoute } from "@tanstack/react-router";
import { Calculator, RotateCcw } from "lucide-react";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useState,
	useTransition,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import BillCounterForm from "@/components/coins/form";
import BillCounterResults from "@/components/coins/result";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Empty,
	EmptyContent,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import {
	canDistributeBillsEvenlyDP,
	type DistributionResult,
} from "@/lib/algo";
import { useBillCounter } from "@/lib/useBillCounter";
import { deepEqual } from "@/lib/utils";
import type { BillCounterFormData } from "@/schemas/billCounter";
import type { StackStats, SubtractionStackStats } from "@/types/api";

/**
 * Results state consolidated into a single object to reduce prop drilling
 */
interface ResultsState {
	showResults: boolean;
	billsMath: DistributionResult | null;
	stackStats: readonly StackStats[] | null;
	subtractionCombos: readonly SubtractionStackStats[] | null;
	selectedComboIdx: number;
}

function getResponseError(payload: unknown): string {
	if (payload && typeof payload === "object" && "error" in payload) {
		const error = (payload as { error: unknown }).error;
		return typeof error === "string" ? error : JSON.stringify(error);
	}

	return "Request failed";
}

const BillCounter: React.FC = () => {
	const { t } = useTranslation();
	// useTransition for pending state
	const [isPending, startTransition] = useTransition();

	// Consolidated results state
	const [resultsState, setResultsState] = useState<ResultsState>({
		showResults: false,
		billsMath: null,
		stackStats: null,
		subtractionCombos: null,
		selectedComboIdx: 0,
	});

	const { form, calculateTotal, resetForm } = useBillCounter();
	const [results, setResults] = useState<ReturnType<
		typeof calculateTotal
	> | null>(null);

	// Get form values and watch for changes
	type FormValues = Parameters<typeof calculateTotal>[0];
	const formValues = form.watch() as FormValues;
	const isDirty = form.formState.isDirty;

	// Sync stackStats when selectedComboIdx changes
	useEffect(() => {
		if (
			resultsState.subtractionCombos &&
			resultsState.selectedComboIdx < resultsState.subtractionCombos.length
		) {
			const selectedCombo =
				resultsState.subtractionCombos[resultsState.selectedComboIdx];
			setResultsState((prev) => ({
				...prev,
				stackStats: selectedCombo.stackStats,
			}));
		}
	}, [resultsState.selectedComboIdx, resultsState.subtractionCombos]);

	// Memoized handler to avoid recreating on every render
	const handleSelectedComboChange = useCallback((idx: number) => {
		setResultsState((prev) => ({ ...prev, selectedComboIdx: idx }));
	}, []);

	const onSubmit = async (data: Parameters<typeof calculateTotal>[0]) => {
		if (form.formState.isSubmitting) {
			return;
		}

		startTransition(() =>
			setResultsState((prev) => ({ ...prev, showResults: true })),
		);

		// Validate targetAmount
		const calculated = calculateTotal(data as BillCounterFormData);
		const total = calculated.total;
		const targetAmount = (data as BillCounterFormData).targetAmount ?? 0;

		if (targetAmount < 0) {
			form.setError("targetAmount", {
				type: "manual",
				message: t("counter.errors.negativeTarget"),
			});
			return;
		}
		if (targetAmount > total / 2) {
			form.setError("targetAmount", {
				type: "manual",
				message: t("counter.errors.targetExceedsHalf"),
			});
			return;
		}

		// Extract bill input
		const input = {
			five: data[5],
			ten: data[10],
			twenty: data[20],
			fifty: data[50],
			hundred: data[100],
		};

		// Check distribution
		const evenly = canDistributeBillsEvenlyDP(
			input,
			targetAmount,
			(data as BillCounterFormData).allowedDenominations,
		);

		setResultsState((prev) => ({ ...prev, billsMath: evenly }));

		// Call appropriate endpoint based on distribution result
		if (evenly.isDivisibleByThree && evenly.canBeEvenlyDistributed) {
			try {
				const perfectRes = await fetch("/api/bills/perfect", {
					method: "POST",
					body: JSON.stringify(data),
					headers: { "Content-Type": "application/json" },
				});
				const res: unknown = await perfectRes.json();
				if (perfectRes.ok === false || !Array.isArray(res)) {
					throw new Error(getResponseError(res));
				}

				startTransition(() => {
					setResultsState((prev) => ({
						...prev,
						stackStats: res as StackStats[],
					}));
				});
			} catch (error) {
				toast.error(t("counter.errors.fetchPerfectFailed"));
				console.error(error);
			}
		} else {
			try {
				const imperfectRes = await fetch("/api/bills/imperfect", {
					method: "POST",
					body: JSON.stringify(data),
					headers: { "Content-Type": "application/json" },
				});
				const res: unknown = await imperfectRes.json();
				if (imperfectRes.ok === false || !Array.isArray(res)) {
					throw new Error(getResponseError(res));
				}

				startTransition(() => {
					setResultsState((prev) => ({
						...prev,
						subtractionCombos: res as SubtractionStackStats[],
						selectedComboIdx: 0, // Reset to first combo
					}));
				});
				toast.warning(t("counter.errors.mathWorkRequired"));
			} catch (error) {
				toast.error(t("counter.errors.fetchImperfectFailed"));
				console.error(error);
			}
		}
	};

	const debouncedSubmit = useDebounceCallback(onSubmit, 500, {
		leading: false,
		trailing: true,
		maxWait: 1500,
	});

	// Use ref to track previous values and avoid unnecessary calculations
	const previousValuesRef = React.useRef<FormValues | null>(null);

	// Auto-calculate when form values change
	useEffect(() => {
		const valuesChanged = !deepEqual(previousValuesRef.current, formValues);
		if (isDirty && valuesChanged) {
			setResultsState((prev) => ({ ...prev, showResults: false }));
			const calculatedResults = calculateTotal(formValues);
			setResults(calculatedResults);
			previousValuesRef.current = { ...formValues };
		}
	}, [formValues, isDirty, calculateTotal]);

	const handleReset = useCallback(() => {
		setResultsState({
			showResults: false,
			billsMath: null,
			stackStats: null,
			subtractionCombos: null,
			selectedComboIdx: 0,
		});
		resetForm();
		setResults(null);
		const defaultValues = form.formState.defaultValues;
		previousValuesRef.current = defaultValues as FormValues;
	}, [resetForm, form.formState.defaultValues]);

	// Memoize the results display condition
	const hasResults = useMemo(
		() =>
			resultsState.stackStats !== null ||
			resultsState.subtractionCombos !== null,
		[resultsState.stackStats, resultsState.subtractionCombos],
	);

	return (
		<div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
			<div className="space-y-2">
				<h1 className="text-2xl font-semibold text-balance sm:text-3xl">
					{t("counter.title")}
				</h1>
				<p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
					{t("counter.formDescription")}
				</p>
			</div>

			<div className="space-y-6">
				<Card className="shadow-sm">
					<CardHeader className="pb-4">
						<div className="flex items-center justify-between gap-4">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Calculator className="h-4 w-4" />
								<span>{t("counter.inputs")}</span>
							</div>
							<Button
								type="button"
								variant="outline"
								onClick={handleReset}
								className="flex items-center gap-2"
							>
								<RotateCcw className="h-4 w-4" />
								{t("common.reset")}
							</Button>
						</div>
					</CardHeader>

					<CardContent className="space-y-6">
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(debouncedSubmit)}
								className="space-y-6"
							>
								<BillCounterForm form={form} />

								{results && (
									<div className="flex items-center justify-between rounded-lg border bg-primary/5 px-4 py-3">
										<span className="text-sm font-medium text-muted-foreground">
											{t("counter.totalAmount")}
										</span>
										<span className="text-xl font-semibold text-primary tabular-nums">
											${results.total.toLocaleString()}
										</span>
									</div>
								)}

								<div className="flex gap-4">
									<Button
										type="submit"
										className="flex-1"
										disabled={isPending || form.formState.isSubmitting}
									>
										{isPending ? (
											<>
												<Spinner className="mr-2 inline-block" />
												{t("common.loading")}
											</>
										) : (
											t("counter.submit")
										)}
									</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>

				{resultsState.showResults && hasResults ? (
					<BillCounterResults
						stackStats={resultsState.stackStats}
						billsMath={resultsState.billsMath}
						subtractionCombos={resultsState.subtractionCombos}
						selectedComboIdx={resultsState.selectedComboIdx}
						onSelectedComboChange={handleSelectedComboChange}
					/>
				) : (
					<div className="rounded-xl border border-dashed bg-card px-6 py-8">
						<Empty>
							<EmptyHeader>
								<EmptyTitle>{t("common.noResults")}</EmptyTitle>
							</EmptyHeader>
							<EmptyContent>{t("counter.noResultsDescription")}</EmptyContent>
						</Empty>
					</div>
				)}
			</div>
		</div>
	);
};

export const Route = createFileRoute("/")({
	component: BillCounter,
});
