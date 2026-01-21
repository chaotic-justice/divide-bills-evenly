import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, DollarSign, Minus, Plus, Users } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/version2")({
	component: CashCounter,
});

interface BillCount {
	fives: number;
	tens: number;
	twenties: number;
	fifties: number;
	hundreds: number;
}

export function CashCounter() {
	const [bills, setBills] = useState<BillCount>({
		fives: 0,
		tens: 0,
		twenties: 0,
		fifties: 0,
		hundreds: 0,
	});

	const [stacks, _setStacks] = useState<number>(1);

	const updateBillCount = (
		denomination: keyof BillCount,
		increment: boolean,
	) => {
		setBills((prev) => ({
			...prev,
			[denomination]: Math.max(0, prev[denomination] + (increment ? 1 : -1)),
		}));
	};

	const handleInputChange = (denomination: keyof BillCount, value: string) => {
		// Remove leading zeros and get the clean value
		console.log("value", value);
		const cleanValue = value.replace(/^0+/, "");
		console.log("cleanValue", cleanValue);
		// If empty after removing zeros, use 0
		const numValue = cleanValue === "" ? 0 : parseInt(cleanValue, 10);
		setBills((prev) => ({
			...prev,
			[denomination]: numValue,
		}));
	};

	const totalAmount =
		bills.fives * 5 +
		bills.tens * 10 +
		bills.twenties * 20 +
		bills.fifties * 50 +
		bills.hundreds * 100;

	const amountPerStack = Math.floor(totalAmount / stacks);
	const remainingAmount = totalAmount % stacks;

	const billTypes = [
		{
			key: "hundreds" as keyof BillCount,
			label: "$100 Bills",
			value: 100,
			color: "bg-success text-success-foreground",
		},
		{
			key: "fifties" as keyof BillCount,
			label: "$50 Bills",
			value: 50,
			color: "bg-warning text-warning-foreground",
		},
		{
			key: "twenties" as keyof BillCount,
			label: "$20 Bills",
			value: 20,
			color: "bg-accent text-accent-foreground",
		},
		{
			key: "tens" as keyof BillCount,
			label: "$10 Bills",
			value: 10,
			color: "bg-chart-2 text-white",
		},
		{
			key: "fives" as keyof BillCount,
			label: "$5 Bills",
			value: 5,
			color: "bg-chart-4 text-white",
		},
	];

	return (
		<div className="max-w-4xl mx-auto space-y-8">
			<div className="space-y-2 text-center">
				<div className="flex items-center justify-center gap-2 mb-4">
					<div className="p-2 rounded-lg bg-accent">
						<Calculator className="w-6 h-6 text-accent-foreground" />
					</div>
					<h1 className="text-3xl font-bold text-balance">Cash Counter</h1>
				</div>
				<p className="text-muted-foreground text-pretty">
					Enter the number of bills for each denomination.
				</p>
			</div>

			<div className="grid gap-8 lg:grid-cols-2">
				{/* Bill Counter Section */}
				<Card className="shadow-lg">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<DollarSign className="w-5 h-5 text-success" />
							Bill Counter
						</CardTitle>
						<CardDescription>
							Enter the number of bills for each denomination.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{billTypes.map((billType) => (
							<div key={billType.key} className="space-y-2">
								<Label htmlFor={billType.key} className="text-sm font-medium">
									{billType.label}
								</Label>
								<div className="flex items-center gap-3">
									<Button
										variant="outline"
										size="icon"
										onClick={() => updateBillCount(billType.key, false)}
										disabled={bills[billType.key] === 0}
										className="w-10 h-10 shrink-0"
									>
										<Minus className="w-4 h-4" />
									</Button>

									<Input
										id={billType.key}
										type="number"
										min="0"
										value={bills[billType.key].toString()}
										onChange={(e) =>
											handleInputChange(billType.key, e.target.value)
										}
										className="font-mono text-lg text-center"
									/>

									<Button
										variant="outline"
										size="icon"
										onClick={() => updateBillCount(billType.key, true)}
										className="w-10 h-10 shrink-0"
									>
										<Plus className="w-4 h-4" />
									</Button>

									<div
										className={`px-3 py-2 rounded-md text-sm font-medium min-w-[80px] text-center ${billType.color}`}
									>
										${(bills[billType.key] * billType.value).toLocaleString()}
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				{/* Results Section */}
				<div className="space-y-6">
					{/* Total Amount */}
					<Card className="shadow-lg">
						<CardHeader>
							<CardTitle className="text-2xl">Total Amount</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-4xl font-bold text-success">
								${totalAmount.toLocaleString()}
							</div>
							<p className="mt-2 text-muted-foreground">
								Total amount of all counted bills
							</p>
						</CardContent>
					</Card>

					{/* Stack Distribution */}
					<Card className="shadow-lg">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="w-5 h-5 text-accent" />
								Stack Distribution
							</CardTitle>
							<CardDescription>
								Divide the total amount evenly across stacks
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* <div className="space-y-2">
                <Label htmlFor="stacks" className="text-sm font-medium">
                  Number of Stacks
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setStacks(Math.max(1, stacks - 1))}
                    disabled={stacks === 1}
                    className="w-10 h-10 shrink-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>

                  <Input
                    id="stacks"
                    type="number"
                    min="1"
                    value={stacks}
                    onChange={(e) => setStacks(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="font-mono text-lg text-center"
                  />

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setStacks(stacks + 1)}
                    className="w-10 h-10 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator /> */}

							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">
										Amount per stack:
									</span>
									<span className="text-xl font-bold text-shadow-accent-foreground">
										${amountPerStack.toLocaleString()}
									</span>
								</div>

								{remainingAmount > 0 && (
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											Remaining amount:
										</span>
										<span className="text-lg font-semibold text-warning">
											${remainingAmount.toLocaleString()}
										</span>
									</div>
								)}

								<div className="p-4 rounded-lg bg-muted">
									<p className="text-sm text-center text-muted-foreground">
										{stacks === 1
											? "All money goes to 1 stack"
											: `Each of the ${stacks} stacks gets $${amountPerStack.toLocaleString()}${remainingAmount > 0 ? ` with $${remainingAmount} left over` : ""}`}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
