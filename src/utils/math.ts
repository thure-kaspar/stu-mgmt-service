export enum RoundingType {
	NONE = "NONE",
	DECIMALS = "DECIMALS",
	DOWN_NEAREST_INTEGER = "DOWN_NEAREST_INTEGER",
	UP_NEAREST_INTEGER = "UP_NEAREST_INTEGER"
}

export function roundingMethod(type: RoundingType, decimals?: number): (value: number) => number {
	switch (type) {
	case RoundingType.NONE: return (value: number): number => value;
	case RoundingType.DECIMALS: return (value: number): number => {
		return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
	};
	case RoundingType.DOWN_NEAREST_INTEGER: return (value: number): number => {
		return Math.floor(value);
	};
	case RoundingType.UP_NEAREST_INTEGER: return (value: number): number => {
		return Math.ceil(value);
	};
	default:
		throw new Error("Unsupported RoundingType!");
	}
}
