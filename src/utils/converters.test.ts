import { describe, it, expect, test } from "vitest";
import { roundNumber, getUnitParsedWeight } from "./converters";

describe("converters", () => {
  describe("edge cases", () => {
    it("should handle zero value", () => {
      expect(() => getUnitParsedWeight(0, "г")).toThrow("Значение не может быть нулевым");
    });

    it("should handle negative value", () => {
      expect(() => getUnitParsedWeight(-100, "г")).toThrow("Значение не может быть отрицательным");
    });
  });
  describe("roundToTwoDecimals (using roundNumber)", () => {
    it("should round numbers to 2 decimal places", () => {
      expect(roundNumber(123.456)).toBe(123.46);
      expect(roundNumber(123.45)).toBe(123.45);
      expect(roundNumber(123.451)).toBe(123.45);
      expect(roundNumber(123.455)).toBe(123.46);
    });

    it("should handle integers", () => {
      expect(roundNumber(123)).toBe(123);
      expect(roundNumber(0)).toBe(0);
    });

    it("should handle negative numbers", () => {
      expect(roundNumber(-123.456)).toBe(-123.46);
      expect(roundNumber(-123.454)).toBe(-123.45);
    });
  });

  describe("roundNumber", () => {
    it("should round numbers to 2 decimal places by default", () => {
      expect(roundNumber(123.456)).toBe(123.46);
      expect(roundNumber(123.45)).toBe(123.45);
      expect(roundNumber(123.451)).toBe(123.45);
      expect(roundNumber(123.455)).toBe(123.46);
    });

    it("should round numbers to specified decimal places", () => {
      expect(roundNumber(123.4567, 3)).toBe(123.457);
      expect(roundNumber(123.45, 1)).toBe(123.5);
      expect(roundNumber(123.45678, 4)).toBe(123.4568);
      expect(roundNumber(123.45678, 0)).toBe(123);
    });

    it("should handle negative decimal places (round to tens, hundreds, etc.)", () => {
      expect(roundNumber(123.25, -1)).toBe(120);
      expect(roundNumber(127.13, -1)).toBe(130);
      expect(roundNumber(1234.56, -2)).toBe(1200);
      expect(roundNumber(1750, -3)).toBe(2000);
    });

    it("should handle integers", () => {
      expect(roundNumber(123)).toBe(123);
      expect(roundNumber(0)).toBe(0);
    });

    it("should handle negative numbers", () => {
      expect(roundNumber(-123.456, 2)).toBe(-123.46);
      expect(roundNumber(-123.454, 2)).toBe(-123.45);
      expect(roundNumber(-127.13, -1)).toBe(-130);
      expect(roundNumber(-0.005, 2)).toBe(-0.01);
    });

    describe("roundNumber with different decimal places", () => {
      test.each([
        // Стандартное округление до 2 знаков
        [123.456, undefined, 123.46],
        [123.454, undefined, 123.45],
        [0.0049, undefined, 0],
        [0.005, undefined, 0.01],
        [999.999, undefined, 1000],
        
        // Округление до целых
        [123.456, 0, 123],
        [123.999, 0, 124],
        
        // Округление до 1 знака
        [123.456, 1, 123.5],
        [123.44, 1, 123.4],
        
        // Округление до 3+ знаков
        [123.4567, 3, 123.457],
        [123.45678, 4, 123.4568],
        
        // Округление до десятков/сотен
        [123.456, -1, 120],
        [127.13, -1, 130],
        [1234.56, -2, 1200],
        [1750, -3, 2000],
      ])("should round %f with %i decimal places to %f", (value, decimalPlaces, expected) => {
      expect(roundNumber(value, decimalPlaces)).toBe(expected);
    });
  });

  describe("getUnitParsedWeight", () => {
    it("should convert grams to kilograms", () => {
      expect(getUnitParsedWeight(500, "г")).toEqual({
        unitLabel: "1 кг",
        multiplier: 2, // 1000 / 500
      });
      expect(getUnitParsedWeight(500, "гр")).toEqual({
        unitLabel: "1 кг",
        multiplier: 2, // 1000 / 500
      });
    });

    it("should handle kilograms", () => {
      expect(getUnitParsedWeight(2, "кг")).toEqual({
        unitLabel: "1 кг",
        multiplier: 0.5, // 1 / 2
      });
    });

    it("should convert milliliters to liters", () => {
      expect(getUnitParsedWeight(500, "мл")).toEqual({
        unitLabel: "1 л",
        multiplier: 2, // 1000 / 500
      });
    });

    it("should handle liters", () => {
      expect(getUnitParsedWeight(2, "л")).toEqual({
        unitLabel: "1 л",
        multiplier: 0.5, // 1 / 2
      });
    });

    it("should handle pieces", () => {
      expect(getUnitParsedWeight(5, "шт")).toEqual({
        unitLabel: "1 шт",
        multiplier: 0.2, // 1 / 5
      });
      expect(getUnitParsedWeight(5, "шт.")).toEqual({
        unitLabel: "1 шт",
        multiplier: 0.2, // 1 / 5
      });
    });

    it("should throw error for unknown units", () => {
      expect(() => getUnitParsedWeight(5, "unknown")).toThrow("Неизвестная единица: unknown");
      expect(() => getUnitParsedWeight(5, "")).toThrow("Неизвестная единица: ");
      expect(() => getUnitParsedWeight(5, " ")).toThrow("Неизвестная единица:  ");
    });

    describe("getUnitParsedWeight conversions", () => {
      describe("weight conversions (grams and kilograms)", () => {
        test.each([
          [250, "г", { unitLabel: "1 кг", multiplier: 4 }],
          [500, "г", { unitLabel: "1 кг", multiplier: 2 }],
          [1000, "г", { unitLabel: "1 кг", multiplier: 1 }],
          [1, "кг", { unitLabel: "1 кг", multiplier: 1 }],
          [0.5, "кг", { unitLabel: "1 кг", multiplier: 2 }],
          [2.5, "кг", { unitLabel: "1 кг", multiplier: 0.4 }],
        ])("should convert %i %s correctly", (value, unit, expected) => {
      });

      describe("volume conversions (ml and liters)", () => {
        test.each([
          [300, "мл", { unitLabel: "1 л", multiplier: 3.3333333333333335 }],
          [500, "мл", { unitLabel: "1 л", multiplier: 2 }],
          [1000, "мл", { unitLabel: "1 л", multiplier: 1 }],
          [1, "л", { unitLabel: "1 л", multiplier: 1 }],
          [0.75, "л", { unitLabel: "1 л", multiplier: 1.3333333333333333 }],
          [2.5, "л", { unitLabel: "1 л", multiplier: 0.4 }],
        ])("should convert %i %s correctly", (value, unit, expected) => {
      });

      describe("piece conversions", () => {
        test.each([
          [1, "шт", { unitLabel: "1 шт", multiplier: 1 }],
          [4, "шт", { unitLabel: "1 шт", multiplier: 0.25 }],
          [10, "шт", { unitLabel: "1 шт", multiplier: 0.1 }],
          [1, "шт.", { unitLabel: "1 шт", multiplier: 1 }],
          [4, "шт.", { unitLabel: "1 шт", multiplier: 0.25 }],
        ])("should convert %i %s correctly", (value, unit, expected) => {
      });

      describe("alternative unit spellings", () => {
        test.each([
          [500, "гр", { unitLabel: "1 кг", multiplier: 2 }],
          [4, "шт.", { unitLabel: "1 шт", multiplier: 0.25 }],
        ])("should handle alternative spelling '%s'", (value, unit, expected) => {
      expect(getUnitParsedWeight(value, unit)).toEqual(expected);
    });
  });
});
