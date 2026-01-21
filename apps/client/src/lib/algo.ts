interface BillCount {
	five: number;
	ten: number;
	twenty: number;
	fifty: number;
	hundred: number;
}

interface AllowedDenominations {
	"5"?: boolean;
	"10"?: boolean;
	"20"?: boolean;
	"50"?: boolean;
	"100"?: boolean;
}

export interface DistributionResult {
	isDivisibleByThree: boolean;
	canBeEvenlyDistributed: boolean;
	totalAmount: number;
	totalBills: number;
	distribution?: {
		stack1: BillCount;
		stack2: BillCount;
		stack3: BillCount;
	};
	reason?: string;
}

/**
 * Helper function to count bills in a stack
 */
export function countBillsInStack(stack: number[]): BillCount {
	return {
		five: stack.filter((denom) => denom === 5).length,
		ten: stack.filter((denom) => denom === 10).length,
		twenty: stack.filter((denom) => denom === 20).length,
		fifty: stack.filter((denom) => denom === 50).length,
		hundred: stack.filter((denom) => denom === 100).length,
	};
}

/**
 * Alternative: DP-based solution for more complex cases
 * This handles edge cases better than greedy algorithm
 */
export function canDistributeBillsEvenlyDP(
		bills: BillCount,
		// optional amount to subtract from total before distributing (e.g., targetAmount)
		subtractAmount = 0,
		// optional allowed denominations for subtraction (whitelist); if provided, only these denoms can be used for subtraction
		allowedDenominations?: AllowedDenominations,
	): DistributionResult {
		const { five, ten, twenty, fifty, hundred } = bills;

		// Calculate original total amount
		const originalTotal =
			five * 5 + ten * 10 + twenty * 20 + fifty * 50 + hundred * 100;

		// Create list of all bills
		const allBills: number[] = [];
		allBills.push(...Array(five).fill(5));
		allBills.push(...Array(ten).fill(10));
		allBills.push(...Array(twenty).fill(20));
		allBills.push(...Array(fifty).fill(50));
		allBills.push(...Array(hundred).fill(100));

		// Sort in descending order for better performance
		allBills.sort((a, b) => b - a);

		const used = new Array(allBills.length).fill(false);

		// If we need to subtract an amount first, try to find a subset of bills that sums to subtractAmount
		if (subtractAmount > 0) {
			// Filter bills to only include allowed denominations for subtraction
			const allowedIndices = allBills
				.map((denom, idx) => {
					const denomStr = denom.toString() as keyof AllowedDenominations;
					const isAllowed = allowedDenominations?.[denomStr] ?? true; // default to true if allowedDenominations not provided
					return isAllowed ? idx : -1;
				})
				.filter((idx) => idx !== -1);

			const subtractSubset = findSubsetSumWithAllowed(
				allBills,
				used,
				subtractAmount,
				allowedIndices,
			);
			if (!subtractSubset) {
				return {
					isDivisibleByThree: false,
					canBeEvenlyDistributed: false,
					totalAmount: originalTotal,
					totalBills: allBills.length,
					reason: `Cannot subtract $${subtractAmount} with available bills (using only allowed denominations)`,
				};
			}

			// mark subtracted bills as used
			subtractSubset.forEach((idx: number) => {
				used[idx] = true;
			});
		}

		const remainingTotal = originalTotal - subtractAmount;

		// Check divisibility of remaining total
		if (remainingTotal % 3 !== 0) {
			return {
				isDivisibleByThree: false,
				canBeEvenlyDistributed: false,
				totalAmount: remainingTotal,
				totalBills: allBills.length - used.filter(Boolean).length,
				reason: `Remaining total $${remainingTotal} is not divisible by 3`,
			};
		}

		const target = remainingTotal / 3;

		// Try to find 3 subsets from remaining bills that sum to target
		for (let i = 0; i < 3; i++) {
			const subset = findSubsetSum(allBills, used, target);
			if (!subset) {
				return {
					isDivisibleByThree: true,
					canBeEvenlyDistributed: false,
					totalAmount: remainingTotal,
					totalBills: allBills.length - used.filter(Boolean).length,
					reason: `Cannot find stack ${i + 1} with value $${target}`,
				};
			}

			subset.forEach((index) => {
				used[index] = true;
			});
		}

		return {
			isDivisibleByThree: true,
			canBeEvenlyDistributed: true,
			totalAmount: remainingTotal,
			totalBills: allBills.length - used.filter(Boolean).length,
		};
	}

/**
 * Helper for DP solution: find subset that sums to target
 */
function findSubsetSum(
	bills: number[],
	used: boolean[],
	target: number,
): number[] | null {
	const n = bills.length;
	const memo: Map<string, boolean> = new Map();

	function dfs(
		index: number,
		currentSum: number,
		path: number[],
	): number[] | null {
		if (currentSum === target) return [...path];
		if (currentSum > target || index >= n) return null;
		if (used[index]) return dfs(index + 1, currentSum, path);

		const key = `${index}-${currentSum}`;
		if (memo.has(key)) return null;

		// Option 1: Take current bill
		path.push(index);
		const withCurrent = dfs(index + 1, currentSum + bills[index], path);
		if (withCurrent) return withCurrent;
		path.pop();

		// Option 2: Skip current bill
		const withoutCurrent = dfs(index + 1, currentSum, path);
		if (withoutCurrent) return withoutCurrent;

		memo.set(key, false);
		return null;
	}

	return dfs(0, 0, []);
}

/**
 * Helper for finding subset with allowed indices (for targetAmount subtraction with denomination whitelist)
 */
function findSubsetSumWithAllowed(
	bills: number[],
	used: boolean[],
	target: number,
	allowedIndices: number[],
): number[] | null {
	const memo: Map<string, boolean> = new Map();

	function dfs(
		allowedIdx: number,
		currentSum: number,
		path: number[],
	): number[] | null {
		if (currentSum === target) return [...path];
		if (currentSum > target || allowedIdx >= allowedIndices.length) return null;

		const idx = allowedIndices[allowedIdx];
		if (used[idx]) return dfs(allowedIdx + 1, currentSum, path);

		const key = `${allowedIdx}-${currentSum}`;
		if (memo.has(key)) return null;

		// Option 1: Take current bill
		path.push(idx);
		const withCurrent = dfs(allowedIdx + 1, currentSum + bills[idx], path);
		if (withCurrent) return withCurrent;
		path.pop();

		// Option 2: Skip current bill
		const withoutCurrent = dfs(allowedIdx + 1, currentSum, path);
		if (withoutCurrent) return withoutCurrent;

		memo.set(key, false);
		return null;
	}

	return dfs(0, 0, []);
}
