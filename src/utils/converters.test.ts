import { describe, it, expect } from "vitest";
import { roundNumber, getUnitParsedWeight } from "./converters";

describe("converters", () => {
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
    });
  });
});
