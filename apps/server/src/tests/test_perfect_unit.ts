import {
	parseBills,
	removeBillsToReachAmount,
	distributeBills,
	computeStackStats,
} from "../utils/bill-logic";

console.log("Testing /perfect endpoint logic...\n");

// Test 1: Without targetAmount (existing behavior)
console.log("Test 1: Without targetAmount");
const [bills1] = parseBills({
	"5": 6,
	"10": 6,
	"20": 4,
	"50": 0,
	"100": 1,
});
const stacks1 = distributeBills(bills1);
const stats1 = computeStackStats(stacks1);
const total1 = stats1.reduce((sum, s) => sum + s.value, 0);
console.log(`  Total: 270 (6x$5 + 6x$10 + 4x$20 + 1x$100), Expected sum = 270`);
console.log(`  Got: ${stats1.map(s => s.value).join(", ")}, Sum: ${total1}`);
if (total1 === 270 && Math.max(...stats1.map(s => s.value)) - Math.min(...stats1.map(s => s.value)) <= 50) {
	console.log("  ✅ PASS\n");
} else {
	console.log("  ❌ FAIL\n");
}

// Test 2: With targetAmount
console.log("Test 2: With targetAmount = 20");
let [bills2] = parseBills({
	"5": 20,
	"10": 10,
	"20": 5,
	"50": 2,
	"100": 1,
});
bills2 = removeBillsToReachAmount({ ...bills2 }, 20, null, undefined);
const stacks2 = distributeBills(bills2);
const stats2 = computeStackStats(stacks2);
console.log(`  Total: 500 - 20 = 480, Expected 3 stacks of 160 each`);
console.log(`  Got: ${stats2.map(s => s.value).join(", ")}`);
if (stats2.every(s => s.value === 160)) {
	console.log("  ✅ PASS\n");
} else {
	console.log("  ❌ FAIL\n");
}

// Test 3: targetAmount of 0 (should be no-op)
console.log("Test 3: With targetAmount = 0 (should not subtract)");
let [bills4] = parseBills({
	"5": 6,
	"10": 6,
	"20": 4,
	"50": 0,
	"100": 1,
});
// Only subtract if > 0 (mimicking the endpoint logic)
if (0 > 0) {
	bills4 = removeBillsToReachAmount({ ...bills4 }, 0, null, undefined);
}
const stacks4 = distributeBills(bills4);
const stats4 = computeStackStats(stacks4);
const total4 = stats4.reduce((sum, s) => sum + s.value, 0);
console.log(`  Total: 270, Expected sum = 270`);
console.log(`  Got: ${stats4.map(s => s.value).join(", ")}, Sum: ${total4}`);
if (total4 === 270 && Math.max(...stats4.map(s => s.value)) - Math.min(...stats4.map(s => s.value)) <= 50) {
	console.log("  ✅ PASS\n");
} else {
	console.log("  ❌ FAIL\n");
}

console.log("All unit tests completed!");
