import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { DistributionResult } from "@/lib/algo";
import type { StackStats, SubtractionCombo } from "@/types/api";
import { DollarSign } from "lucide-react";
import React, { useMemo } from "react";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface BillCounterResultsProps {
	stackStats: StackStats[] | null;
	billsMath: DistributionResult | null;
	subtractionCombos: SubtractionCombo[] | null;
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
  // Memoize computed combo descriptions to avoid recalculation on every render
  const comboDescriptions = useMemo(() => {
    return subtractionCombos?.map((combo) => {
      const parts: string[] = [];
      if (combo.combination) {
        for (const [bill, qty] of Object.entries(combo.combination)) {
          parts.push(`${qty} bills of ${bill}`);
        }
      }
      return `Removing ${parts.join(", ")}.`;
    }) || [];
  }, [subtractionCombos]);

  const stacks = 3;
  const hasNoDistribution = billsMath &&
    (!billsMath.isDivisibleByThree || !billsMath.canBeEvenlyDistributed);
  const hasResults = stackStats && stackStats.length > 0;

	return (
		<Card className="shadow-lg">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<DollarSign className="w-5 h-5" />
					Math Work
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
          {/* Warning card when distribution is not perfect */}
          {hasNoDistribution && subtractionCombos && subtractionCombos.length > 0 && (
						<Card className="shadow-md border-warning">
							<CardHeader>
								<CardTitle className="flex items-center justify-between text-lg">
									<span className="text-muted-foreground">
										The total amount cannot be divided evenly by 3, or there are
										not enough bills available to distribute evenly into 3
										stacks. Please adjust as suggested below.
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
                <div className="flex items-center justify-between">
                  <RadioGroup
                    value={selectedComboIdx.toString()}
                    onValueChange={(v) => onSelectedComboChange(parseInt(v))}
                  >
                    {subtractionCombos.map((_, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <RadioGroupItem
                          value={idx.toString()}
                          id={`combo-${idx}`}
                        />
                        <Label htmlFor={`combo-${idx}`}>
                          {comboDescriptions[idx] || "Empty Label"}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
								</div>
							</CardContent>
						</Card>
          )}

          {/* Results display */}
          {hasResults && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h6 className="font-semibold">
                  New Total:{" "}
                  {subtractionCombos
                    ? subtractionCombos[selectedComboIdx]?.newTotal
                    : billsMath?.totalAmount}
                </h6>
                <span className="text-sm text-muted-foreground">
                  ({stacks} {stacks > 1 ? "Stacks" : "Stack"})
                </span>
              </div>

							<div className="grid gap-4 md:grid-cols-2">
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
  const denominations = [100, 50, 20, 10, 5] as const;
  const billsToShow = denominations.filter((denom) => stack.distribution[denom] > 0);

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Stack #{stack.index}</span>
          <span className="text-success">${stack.value.toLocaleString()}</span>
        </CardTitle>
        <CardDescription>
          {stack.billCount} {stack.billCount === 1 ? "bill" : "bills"} total
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1.5 text-sm">
          {billsToShow.length > 0 ? (
            billsToShow.map((denom) => (
              <div key={denom} className="flex items-center justify-between">
                <span className="text-muted-foreground">${denom} bills:</span>
                <span className="font-medium">{stack.distribution[denom]}</span>
              </div>
            ))
          ) : (
            <div className="py-2 text-center text-muted-foreground">No bills</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default BillCounterResults;
