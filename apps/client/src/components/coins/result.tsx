import { DollarSign } from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { DistributionResult } from "@/lib/algo";
import type { StackStats, SubtractionCombo } from "@/types/api";
import { Label } from "../ui/label";

import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

const DENOMINATIONS = [100, 50, 20, 10, 5] as const;

interface BillCounterResultsProps {
	stackStats: readonly StackStats[] | null;
	billsMath: DistributionResult | null;
	subtractionCombos: readonly SubtractionCombo[] | null;
	selectedComboIdx: number;
	onSelectedComboChange: (idx: number) => void;
}

const BillCounterResults: React.FC<BillCounterResultsProps> = ({
	stackStats,
	billsMath,
	subtractionCombos,
	selectedComboIdx,
	onSelectedComboChange,
}) => {
	const { t } = useTranslation();
	const safeSubtractionCombos: readonly SubtractionCombo[] | null =
		Array.isArray(subtractionCombos) ? subtractionCombos : null;

	// Memoize computed combo descriptions to avoid recalculation on every render
	const comboDescriptions = useMemo(() => {
		return (
			safeSubtractionCombos?.map((combo) => {
				const parts: string[] = [];
				if (combo.combination) {
					for (const [bill, qty] of Object.entries(combo.combination)) {
						parts.push(t("counter.combos.part", { count: qty, denom: bill }));
					}
				}
				return t("counter.combos.removing", { parts: parts.join(", ") });
			}) || []
		);
	}, [safeSubtractionCombos, t]);

	const stacks = 3;
	const hasNoDistribution =
		billsMath &&
		(!billsMath.isDivisibleByThree || !billsMath.canBeEvenlyDistributed);
	const hasResults = stackStats && stackStats.length > 0;

	return (
		<Card className="shadow-sm">
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-2">
					<DollarSign className="w-5 h-5" />
					{t("counter.mathWork")}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-5">
					{hasNoDistribution &&
						safeSubtractionCombos &&
						safeSubtractionCombos.length > 0 && (
							<div className="rounded-lg border border-warning/40 bg-warning/10 p-4">
								<p className="text-sm font-medium text-foreground">
									{t("counter.imperfectWarning")}
								</p>
								<div className="mt-4">
									<RadioGroup
										value={selectedComboIdx.toString()}
										onValueChange={(v) => {
											onSelectedComboChange(parseInt(v, 10));
										}}
									>
										<div className="grid gap-3">
											{safeSubtractionCombos.map((combo, comboIdx) => (
												<div
													key={`${combo.newTotal}-${combo.amountSubtracted}`}
													className="flex items-start gap-3 rounded-md border bg-background px-3 py-2"
												>
													<RadioGroupItem
														value={comboIdx.toString()}
														id={`combo-${comboIdx}`}
														className="mt-0.5"
													/>
													<Label
														htmlFor={`combo-${comboIdx}`}
														className="text-sm leading-6"
													>
														{comboDescriptions[comboIdx] || "Empty Label"}
													</Label>
												</div>
											))}
										</div>
									</RadioGroup>
								</div>
							</div>
						)}

					{/* Results display */}
					{hasResults && (
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<h6 className="text-sm font-medium text-muted-foreground">
									{t("counter.newTotal")}{" "}
									{safeSubtractionCombos
										? safeSubtractionCombos?.[selectedComboIdx]?.newTotal
										: billsMath?.totalAmount}
								</h6>
								<span className="text-sm text-muted-foreground">
									({t("counter.stackCount", { count: stacks })})
								</span>
							</div>

							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
								{stackStats.map((stack) => (
									<StackCard key={stack.index} stack={stack} />
								))}
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

/**
 * Extracted component for rendering a single stack card
 */
interface StackCardProps {
	stack: StackStats;
}

const StackCard: React.FC<StackCardProps> = ({ stack }) => {
	const { t } = useTranslation();
	const billsToShow = DENOMINATIONS.filter(
		(denom) => stack.distribution[denom] > 0,
	);

	return (
		<Card className="shadow-sm">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center justify-between text-base">
					<span>{t("counter.stackTitle", { index: stack.index })}</span>
					<span className="tabular-nums text-success">
						${stack.value.toLocaleString()}
					</span>
				</CardTitle>
				<CardDescription>
					{t("counter.billCount", { count: stack.billCount })}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-2">
				<div className="space-y-1.5 text-sm">
					{billsToShow.length > 0 ? (
						billsToShow.map((denom) => (
							<div key={denom} className="flex items-center justify-between">
								<span className="text-muted-foreground">
									{t("counter.billsLabel", { denom })}
								</span>
								<span className="font-medium">{stack.distribution[denom]}</span>
							</div>
						))
					) : (
						<div className="py-2 text-center text-muted-foreground">
							{t("counter.noBills")}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default BillCounterResults;
