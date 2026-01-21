interface Bills {
	[key: number]: number;
}

interface StackStats {
	index: number;
	value: number;
	billCount: number;
	distribution: Bills;
}

interface SubtractionCombo {
	newTotal: number;
	amountSubtracted: number;
	combination: Bills | null;
	description: string;
}

interface SubtractionStackStats extends SubtractionCombo {
	stackStats: StackStats[];
}

interface BodyInput {
	"5": number;
	"10": number;
	"20": number;
	"50": number;
	"100": number;
}

function memoize<Args extends unknown[], Return>(
	fn: (...args: Args) => Return,
): (...args: Args) => Return {
	const cache = new Map<string, Return>();
	return (...args: Args): Return => {
		const key = JSON.stringify(args);
		const cached = cache.get(key);
		if (cached !== undefined) {
			return cached;
		}
		const result = fn(...args);
		cache.set(key, result);
		return result;
	};
}

export function parseBills(body: BodyInput): [Bills, number] {
	const keysToExtract = ["5", "10", "20", "50", "100"];
	const obj = Object.fromEntries(
		Object.entries(body).filter(([key]) => keysToExtract.includes(key)),
	);
	const bills: Bills = {};
	for (const [k, v] of Object.entries(obj)) {
		bills[Number.parseInt(k, 10)] = v as number;
	}
	const total = Object.entries(bills).reduce(
		(sum, [denom, count]) => sum + Number.parseInt(denom, 10) * count,
		0,
	);

	return [bills, total];
}

export function canRemoveAmount(
	bills: Bills,
	targetAmount: number,
	allowedDenoms?: number[],
): boolean {
	const denominations = allowedDenoms || [100, 50, 20, 10, 5];

	const canReachAmount = memoize(
		(
			remainingAmount: number,
			denomIndex: number,
			billsState: number[],
		): boolean => {
			if (remainingAmount === 0) return true;
			if (remainingAmount < 0 || denomIndex >= denominations.length)
				return false;

			const denom = denominations[denomIndex];
			const maxAvailable = billsState[denomIndex];

			if (maxAvailable === 0) {
				return canReachAmount(remainingAmount, denomIndex + 1, billsState);
			}

			const maxCount = Math.min(
				maxAvailable,
				Math.floor(remainingAmount / denom),
			);
			for (let count = maxCount; count >= 0; count--) {
				const newRemaining = remainingAmount - count * denom;
				const newBillsState = [...billsState];
				newBillsState[denomIndex] = maxAvailable - count;

				if (canReachAmount(newRemaining, denomIndex + 1, newBillsState)) {
					return true;
				}
			}

			return false;
		},
	);

	const billsState = denominations.map((denom) => bills[denom] || 0);
	return canReachAmount(targetAmount, 0, billsState);
}

export function findSubtractionOptions(
	totalValue: number,
	bills: Bills,
	targetAmount?: number,
	allowedDenoms?: number[],
): number[] {
	const remainder = totalValue % 3;
	const neededRemainder = remainder;

	// If target provided, we focus on it.
	if (targetAmount !== undefined) {
		// 1. Check if targetAmount is valid
		if (
			targetAmount <= totalValue &&
			targetAmount % 3 === neededRemainder &&
			canRemoveAmount(bills, targetAmount, allowedDenoms) &&
			canAchievePerfectDistribution(bills, targetAmount)
		) {
			return [targetAmount];
		}

		// 2. Proximity Search
		const results: number[] = [];

		// Lower bound
		for (let amt = targetAmount - 1; amt >= 1; amt--) {
			if (
				amt % 3 === neededRemainder &&
				canRemoveAmount(bills, amt, allowedDenoms) &&
				canAchievePerfectDistribution(bills, amt)
			) {
				results.push(amt);
				break; // Found closest lower
			}
		}

		// Upper bound
		for (let amt = targetAmount + 1; amt < totalValue; amt++) {
			if (
				amt % 3 === neededRemainder &&
				canRemoveAmount(bills, amt, allowedDenoms) &&
				canAchievePerfectDistribution(bills, amt)
			) {
				results.push(amt);
				break; // Found closest upper
			}
		}

		return results.sort((a, b) => a - b);
	}

	// Default fallback (no target)
	let shouldSearch = remainder !== 0;

	if (!shouldSearch) {
		shouldSearch = !canAchievePerfectDistribution(bills, 0);
	}

	if (!shouldSearch) return [];

	let searchRemainder = neededRemainder;
	if (remainder === 0) searchRemainder = 0;

	const possibleAmounts: number[] = [];
	const maxAmt = Math.min(100, totalValue);

	for (let amount = 1; amount <= maxAmt; amount++) {
		if (searchRemainder === 0) {
			possibleAmounts.push(amount);
		} else if (amount % 3 === searchRemainder) {
			possibleAmounts.push(amount);
		}
	}

	const validAmounts: number[] = [];
	for (const amount of possibleAmounts) {
		if (amount > totalValue) continue;
		if (
			canRemoveAmount(bills, amount, allowedDenoms) &&
			canAchievePerfectDistribution(bills, amount)
		) {
			validAmounts.push(amount);
		}
		if (validAmounts.length >= 5) break;
	}

	// Fallback search if not enough results
	if (validAmounts.length < 5) {
		for (let amount = maxAmt + 1; amount < totalValue; amount++) {
			if (
				canRemoveAmount(bills, amount, allowedDenoms) &&
				canAchievePerfectDistribution(bills, amount)
			) {
				validAmounts.push(amount);
				if (validAmounts.length >= 5) break;
			}
		}
	}

	return validAmounts.sort((a, b) => a - b);
}

export function canAchievePerfectDistribution(
	originalBills: Bills,
	subtractionAmount: number,
): boolean {
	const bills = { ...originalBills };
	const remainingBills = removeBillsToReachAmount(bills, subtractionAmount);

	let remainingValue = 0;
	for (const [denom, count] of Object.entries(remainingBills)) {
		remainingValue += Number.parseInt(denom, 10) * count;
	}

	if (remainingValue % 3 !== 0) return false;

	const targetPerStack = Math.floor(remainingValue / 3);
	return canDistributePerfectly(remainingBills, targetPerStack);
}

export function canDistributePerfectly(bills: Bills, target: number): boolean {
	if (target % 5 !== 0) return false;

	const denoms = [100, 50, 20, 10, 5];
	const activeDenoms = denoms.filter((d) => (bills[d] || 0) > 0);
	const counts = activeDenoms.map((d) => bills[d]);

	// Scaling factor (everything is multiple of 5)
	// Max sum is target. Index = sum / 5.
	const dim = target / 5 + 1;

	// Memoization: 0 = unvisited, 1 = true, 2 = false
	// Size: (activeDenoms.length) * dim * dim
	const memo = new Uint8Array(activeDenoms.length * dim * dim);

	function solve(idx: number, s1: number, s2: number): boolean {
		if (s1 > target || s2 > target) return false;

		if (idx === activeDenoms.length) {
			return s1 === target && s2 === target;
		}

		// Symmetry breaking
		let minS = s1;
		let maxS = s2;
		if (s1 > s2) {
			minS = s2;
			maxS = s1;
		}

		const stateIdx = idx * dim * dim + (minS / 5) * dim + maxS / 5;
		if (memo[stateIdx] !== 0) return memo[stateIdx] === 1;

		const denom = activeDenoms[idx];
		const count = counts[idx];

		for (let c1 = 0; c1 <= count; c1++) {
			const nextS1 = s1 + c1 * denom;
			if (nextS1 > target) break;

			for (let c2 = 0; c2 <= count - c1; c2++) {
				const nextS2 = s2 + c2 * denom;
				if (nextS2 > target) break;

				if (solve(idx + 1, nextS1, nextS2)) {
					memo[stateIdx] = 1;
					return true;
				}
			}
		}

		memo[stateIdx] = 2;
		return false;
	}

	return solve(0, 0, 0);
}

export function getRemovalCombination(
	bills: Bills,
	targetAmount: number,
	allowedDenoms?: number[],
): Bills | null {
	const denominations = allowedDenoms || [100, 50, 20, 10, 5];
	const memo = new Map<string, Bills | null>();

	const findCombination = (
		remainingAmount: number,
		denomIndex: number,
		billsRemaining: number[],
	): Bills | null => {
		if (remainingAmount === 0) return {};
		if (remainingAmount < 0 || denomIndex >= denominations.length) return null;

		const key = JSON.stringify([remainingAmount, denomIndex, billsRemaining]);
		const cached = memo.get(key);
		if (cached !== undefined) return cached;

		const denom = denominations[denomIndex];
		const maxAvailable = billsRemaining[denomIndex];
		const maxCount = Math.min(
			maxAvailable,
			Math.floor(remainingAmount / denom),
		);

		for (let count = maxCount; count >= 0; count--) {
			const newRemaining = remainingAmount - count * denom;
			const newBillsRemaining = [...billsRemaining];
			newBillsRemaining[denomIndex] = maxAvailable - count;

			const result = findCombination(
				newRemaining,
				denomIndex + 1,
				newBillsRemaining,
			);
			if (result !== null) {
				const combination = { ...result };
				if (count > 0) combination[denom] = count;
				memo.set(key, combination);
				return combination;
			}
		}

		memo.set(key, null);
		return null;
	};

	const billsList = denominations.map((denom) => bills[denom] || 0);
	return findCombination(targetAmount, 0, billsList);
}

export function describeRemovalCombination(combination: Bills | null): string {
	if (!combination || Object.keys(combination).length === 0) {
		return "No bills need to be removed";
	}

	const billsDesc: string[] = [];
	let totalRemoved = 0;
	const denominations = [100, 50, 20, 10, 5];

	for (const denom of denominations) {
		const count = combination[denom] || 0;
		if (count > 0) {
			totalRemoved += denom * count;
			const billWord = count === 1 ? "bill" : "bills";
			billsDesc.push(`${count} $${denom} ${billWord}`);
		}
	}

	return billsDesc.length > 0
		? `Remove ${billsDesc.join(", ")} (total: $${totalRemoved})`
		: "No bills will be removed";
}

export function optimizeBillSubtraction(
	totalValue: number,
	bills: Bills,
	targetAmount?: number,
	allowedDenominationMap?: Record<string, boolean>,
): SubtractionCombo[] {
	// No check for targetAmount validity here (handled in findSubtractionOptions or trivial)

	let allowedDenoms: number[] | undefined;
	if (allowedDenominationMap) {
		allowedDenoms = Object.entries(allowedDenominationMap)
			.filter(([_, allowed]) => allowed)
			.map(([denom]) => Number.parseInt(denom, 10))
			.sort((a, b) => b - a);
	}

	const subtractionOptions = findSubtractionOptions(
		totalValue,
		bills,
		targetAmount,
		allowedDenoms,
	);

	if (subtractionOptions.length === 0) return [];

	const subtractionCombos: SubtractionCombo[] = [];
	for (const amountSubtracted of subtractionOptions) {
		const newTotal = totalValue - amountSubtracted;
		const combination = getRemovalCombination(
			bills,
			amountSubtracted,
			allowedDenoms,
		);
		const description = describeRemovalCombination(combination);
		subtractionCombos.push({
			newTotal,
			amountSubtracted,
			combination,
			description,
		});
	}

	return subtractionCombos;
}

export function applySubtractionOptions(
	desiredTotal: number,
	selectedCombination: Bills | null,
	bills: Bills,
	allowedDenominationMap?: Record<string, boolean>,
): { remainingBills: Bills; desiredTotal: number } {
	let allowedDenoms: number[] | undefined;
	if (allowedDenominationMap) {
		allowedDenoms = Object.entries(allowedDenominationMap)
			.filter(([_, allowed]) => allowed)
			.map(([denom]) => Number.parseInt(denom, 10))
			.sort((a, b) => b - a);
	}

	const remainingBills = removeBillsToReachAmount(
		{ ...bills },
		desiredTotal,
		selectedCombination,
		allowedDenoms,
	);
	return { remainingBills, desiredTotal };
}

export function removeBillsToReachAmount(
	bills: Bills,
	targetAmount: number,
	combination: Bills | null = null,
	allowedDenoms?: number[],
): Bills {
	const removedBills: Bills = { 5: 0, 10: 0, 20: 0, 50: 0, 100: 0 };

	let workingCombination = combination;
	if (workingCombination === null) {
		workingCombination = getRemovalCombination(
			bills,
			targetAmount,
			allowedDenoms,
		);
	}

	if (workingCombination === null) {
		// Fallback greedy approach
		let currentAmount = 0;
		const denominations = allowedDenoms || [100, 50, 20, 10, 5];
		for (const denom of denominations) {
			while ((bills[denom] || 0) > 0 && currentAmount + denom <= targetAmount) {
				bills[denom] = (bills[denom] || 0) - 1;
				removedBills[denom] += 1;
				currentAmount += denom;
				if (currentAmount === targetAmount) break;
			}
			if (currentAmount === targetAmount) break;
		}
	} else {
		// ... existing logic for explicit combination ...
		for (const [denom, count] of Object.entries(workingCombination)) {
			const k = Number.parseInt(denom, 10);
			bills[k] = (bills[k] || 0) - (count as number);
			removedBills[k] += count as number;
		}
	}

	return bills;
}

export function distributeBills(bills: Bills): Bills[] {
	const allBills: number[] = [];
	for (const [denomination, count] of Object.entries(bills)) {
		const denom = Number.parseInt(denomination, 10);
		allBills.push(...Array(count).fill(denom));
	}

	allBills.sort((a, b) => b - a);

	const stacks: Bills[] = [
		{ 5: 0, 10: 0, 20: 0, 50: 0, 100: 0 },
		{ 5: 0, 10: 0, 20: 0, 50: 0, 100: 0 },
		{ 5: 0, 10: 0, 20: 0, 50: 0, 100: 0 },
	];
	const stackValues = [0, 0, 0];
	const stackBillCounts = [0, 0, 0];

	for (const bill of allBills) {
		const minValue = Math.min(...stackValues);
		const candidateStacks = stackValues
			.map((val, idx) => (val === minValue ? idx : -1))
			.filter((idx) => idx !== -1);

		let targetStack: number;
		if (candidateStacks.length > 1) {
			const minBillCount = Math.min(
				...candidateStacks.map((i) => stackBillCounts[i]),
			);
			const found = candidateStacks.find(
				(i) => stackBillCounts[i] === minBillCount,
			);
			targetStack = found !== undefined ? found : candidateStacks[0];
		} else {
			targetStack = candidateStacks[0];
		}

		stacks[targetStack][bill] += 1;
		stackValues[targetStack] += bill;
		stackBillCounts[targetStack] += 1;
	}

	return refineDistribution(stacks, stackValues);
}

export function refineDistribution(
	stacks: Bills[],
	stackValues: number[],
): Bills[] {
	const maxIterations = 100;
	for (let iter = 0; iter < maxIterations; iter++) {
		const maxValue = Math.max(...stackValues);
		const minValue = Math.min(...stackValues);
		const maxIdx = stackValues.indexOf(maxValue);
		const minIdx = stackValues.indexOf(minValue);

		if (maxValue - minValue <= 50) break;

		let moved = false;
		for (const denomination of [100, 50, 20, 10, 5]) {
			if (stacks[maxIdx][denomination] > 0) {
				if (
					stackValues[maxIdx] - denomination >=
					stackValues[minIdx] + denomination
				) {
					stacks[maxIdx][denomination] -= 1;
					stacks[minIdx][denomination] += 1;
					stackValues[maxIdx] -= denomination;
					stackValues[minIdx] += denomination;
					moved = true;
					break;
				}
			}
		}

		if (!moved) break;
	}

	return stacks;
}

export function computeStackStats(stacks: Bills[]): StackStats[] {
	const stats: StackStats[] = [];
	for (let i = 0; i < stacks.length; i++) {
		const stack = stacks[i];
		let totalValue = 0;
		let totalBills = 0;

		for (const [denom, count] of Object.entries(stack)) {
			totalValue += Number.parseInt(denom, 10) * count;
			totalBills += count;
		}

		stats.push({
			index: i + 1,
			value: totalValue,
			billCount: totalBills,
			distribution: { ...stack },
		});
	}
	return stats;
}

export type { Bills, StackStats, SubtractionStackStats };
