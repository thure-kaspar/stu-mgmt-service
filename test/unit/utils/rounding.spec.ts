import { roundingMethod, RoundingType } from "../../../src/utils/math";

describe("Rounding-Strategies", () => {

	const value = 12.3456789;
	
	describe("NONE", () => {
	
		it("Returns given value without rounding", () => {
			const round = roundingMethod(RoundingType.NONE);
			const result = round(value);
			expect(result).toEqual(value);
		});
	
	});

	describe("DECIMALS", () => {

		it("Rounds to specified decimal place", () => {
			const round = roundingMethod(RoundingType.DECIMALS, 2);
			const result = round(value);
			expect(result).toEqual(12.35);
		});
	
		it("Last digit <= 4 -> Rounds down", () => {
			const endsWith4 = 10.24;
			const round = roundingMethod(RoundingType.DECIMALS, 1);
			const result = round(endsWith4);
			expect(result).toEqual(10.2);
		});

		it("Last digit >= 5 -> Rounds up", () => {
			const endsWith5 = 10.25;
			const round = roundingMethod(RoundingType.DECIMALS, 1);
			const result = round(endsWith5);
			expect(result).toEqual(10.30);
		});

		it("0 -> Rounds to nearest integer", () => {
			const round = roundingMethod(RoundingType.DECIMALS, 0);
			const result = round(value);
			expect(result).toEqual(12);
		});

		it("Negative decimal -> Rounds digits before comma", () => {
			const round = roundingMethod(RoundingType.DECIMALS, -1);
			const result = round(value);
			expect(result).toEqual(10);
		});
	
	});

	describe("DOWN_NEAREST_INTEGER", () => {
	
		it("Rounds down to nearest integer", () => {
			const round = roundingMethod(RoundingType.DOWN_NEAREST_INTEGER);
			const result = round(value);
			expect(result).toEqual(12);
		});
	
	});

	describe("UP_NEAREST_INTEGER", () => {
	
		it("Rounds down to nearest integer", () => {
			const round = roundingMethod(RoundingType.UP_NEAREST_INTEGER);
			const result = round(value);
			expect(result).toEqual(13);
		});
	
	});

});
