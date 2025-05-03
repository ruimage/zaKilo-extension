import { UnitLabel } from "@/types/IStrategy";

/**
 * Rounds a number to the specified number of decimal places
 * @param value - The number to round
 * @param decimalPlaces - The number of decimal places to round to (default: 2)
 *                      - If negative, rounds to tens, hundreds, etc.
 * @returns The rounded number
 */
export function roundNumber(value: number, decimalPlaces: number = 2): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(value * factor) / factor;
}

export function getUnitParsedWeight(value: number, unit: string): UnitLabel {
  switch (unit) {
    case "г":
    case "гр":
      return { unitLabel: "1 кг", multiplier: 1000 / value };
    case "кг":
      return { unitLabel: "1 кг", multiplier: 1 / value };
    case "мл":
      return { unitLabel: "1 л", multiplier: 1000 / value };
    case "л":
      return { unitLabel: "1 л", multiplier: 1 / value };
    case "шт":
    case "шт.":
      return { unitLabel: "1 шт", multiplier: 1 / value };
    default:
      throw new Error("Неизвестная единица: " + unit);
  }
}
