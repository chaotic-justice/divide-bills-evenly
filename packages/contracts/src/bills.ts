export type Bills = Record<number, number>;

export type StackStats = Readonly<{
	index: number;
	value: number;
	billCount: number;
	distribution: Bills;
}>;

export type SubtractionCombo = Readonly<{
	newTotal: number;
	amountSubtracted: number;
	combination: Bills | null;
	description: string;
}>;

export type SubtractionStackStats = SubtractionCombo &
	Readonly<{
		stackStats: StackStats[];
	}>;
