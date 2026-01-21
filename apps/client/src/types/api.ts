export interface Bills {
	[key: number]: number;
}

export interface StackStats {
	index: number;
	value: number;
	billCount: number;
	distribution: Bills;
}

export type SubtractionCombo = {
	newTotal: number;
	amountSubtracted: number;
	combination: Bills | null;
	description: string;
};

export interface SubtractionStackStats extends SubtractionCombo {
	stackStats: StackStats[];
}
