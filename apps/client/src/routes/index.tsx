import BillCounterForm from "@/components/coins/form";
import BillCounterResults from "@/components/coins/result";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
  canDistributeBillsEvenlyDP,
  type DistributionResult,
} from "@/lib/algo";
import { useBillCounter } from "@/lib/useBillCounter";
import type { BillCounterFormData } from "@/schemas/billCounter";
import { deepEqual } from "@/lib/utils";
import type { StackStats, SubtractionStackStats } from "@/types/api";
import { createFileRoute } from "@tanstack/react-router";
import { Calculator, RotateCcw } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyTitle, EmptyContent } from "@/components/ui/empty";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";

/**
 * Results state consolidated into a single object to reduce prop drilling
 */
interface ResultsState {
  showResults: boolean;
  billsMath: DistributionResult | null;
  stackStats: StackStats[] | null;
  subtractionCombos: SubtractionStackStats[] | null;
  selectedComboIdx: number;
}

const BillCounter: React.FC = () => {
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
  const [results, setResults] = useState<ReturnType<typeof calculateTotal> | null>(null);

  // Get form values and watch for changes
  type FormValues = Parameters<typeof calculateTotal>[0];
  const formValues = form.watch() as FormValues
  const isDirty = form.formState.isDirty;

  // Sync stackStats when selectedComboIdx changes
  useEffect(() => {
    if (resultsState.subtractionCombos && resultsState.selectedComboIdx < resultsState.subtractionCombos.length) {
      const selectedCombo = resultsState.subtractionCombos[resultsState.selectedComboIdx];
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

    startTransition(() => setResultsState((prev) => ({ ...prev, showResults: true })));

    // Validate targetAmount
    const calculated = calculateTotal(data as BillCounterFormData);
    const total = calculated.total;
    const targetAmount = (data as BillCounterFormData).targetAmount ?? 0;

    if (targetAmount < 0) {
      form.setError("targetAmount", { type: "manual", message: "Target cannot be negative" });
      return;
    }
    if (targetAmount > total / 2) {
      form.setError("targetAmount", { type: "manual", message: "Target cannot exceed half the total" });
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
        });
        const res = await perfectRes.json();
        startTransition(() => {
          setResultsState((prev) => ({ ...prev, stackStats: res as StackStats[] }));
        });
      } catch (error) {
        toast.error("Failed to fetch perfect distribution");
        console.error(error);
      }
    } else {
      try {
        const imperfectRes = await fetch("api/bills/imperfect", {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
        });
        const res = await imperfectRes.json();
        startTransition(() => {
          setResultsState((prev) => ({
            ...prev,
            subtractionCombos: res as SubtractionStackStats[],
            selectedComboIdx: 0, // Reset to first combo
          }));
        });
        toast.warning("Math work required");
      } catch (error) {
        toast.error("Failed to fetch imperfect distribution");
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
    () => resultsState.stackStats !== null || resultsState.subtractionCombos !== null,
    [resultsState.stackStats, resultsState.subtractionCombos]
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-accent">
            <Calculator className="w-6 h-6 text-accent-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-balance">Cash Counter</h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardDescription>
                  Enter the number of bills for each denomination.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
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
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/10">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">
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
                        <Spinner className="inline-block mr-2" />
                        Loading...
                      </>
                    ) : (
                      "Split into 3 stacks"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-6">
          {resultsState.showResults && hasResults ? (
            <BillCounterResults
              stackStats={resultsState.stackStats}
              billsMath={resultsState.billsMath}
              subtractionCombos={resultsState.subtractionCombos}
              selectedComboIdx={resultsState.selectedComboIdx}
              onSelectedComboChange={handleSelectedComboChange}
            />
          ) : (
              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>No results</EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                      Enter values and submit to see possible splits or subtraction combos.
                    </EmptyContent>
                  </Empty>
                </CardContent>
              </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/")({
  component: BillCounter,
});
