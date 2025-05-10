import type { UnitLabel } from "@/types/IStrategy";

/**
 * Rounds a number to the specified number of decimal places
 * @param value - The number to round
 * @param decimalPlaces - The number of decimal places to round to (default: 2)
 *                      - If negative, rounds to tens, hundreds, etc.
 * @returns The rounded number
 */
export function roundNumber(value: number, decimalPlaces: number = 2): number {
  const factor = Math.pow(10, decimalPlaces);
  const rounded = Math.round(Math.abs(value) * factor) / factor;
  return value < 0 ? -rounded : rounded;
}

export function getUnitParsedWeight(value: number, unit: string): UnitLabel {
  if (value === 0) {
    throw new Error("Значение не может быть нулевым");
  }
  if (value < 0) {
    throw new Error("Значение не может быть отрицательным");
  }
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

export function parseQuantityFromText(text: string): { value: number; unit: string } | null {
  if (!text) return null;
  const cleaned = text.replace(/\s+/g, ' ').replace(/,/g, '.').trim();

  // Вспомогательная функция для валидации unit
  const isValidUnit = (unit: string) => /[a-zа-я]/i.test(unit);

  // 1. Формат "2 x 500 г" или "2×500г" или "2x500г"
  const mulMatch = cleaned.match(/(\d+(?:[.,]\d+)?)\s*[x×*]\s*(\d+(?:[.,]\d+)?)[ ]*([а-яa-zA-Z.]+)/i);
  if (mulMatch) {
    const count = parseFloat(mulMatch[1].replace(',', '.'));
    const per = parseFloat(mulMatch[2].replace(',', '.'));
    const unit = mulMatch[3].toLowerCase();
    if (isValidUnit(unit)) return { value: count * per, unit };
  }

  // 2. Формат "10 шт" или "1.075 л" или "1,075 л" — ищем все совпадения, возвращаем последнее валидное
  const simpleRegex = /(\d+(?:[.,]\d+)?)[ ]*([а-яa-zA-Z.]+)/ig;
  const allSimple = Array.from(cleaned.matchAll(simpleRegex));
  for (let i = allSimple.length - 1; i >= 0; i--) {
    const match = allSimple[i];
    const value = parseFloat(match[1].replace(',', '.'));
    const unit = match[2].toLowerCase();
    if (isValidUnit(unit)) return { value, unit };
  }

  // 3. Формат "упаковка 10 шт" или "нетто 500 г" (ищем первое число и единицу)
  const fallbackMatch = cleaned.match(/(\d+(?:[.,]\d+)?)[^\dа-яa-zA-Z]+([а-яa-zA-Z.]+)/i);
  if (fallbackMatch) {
    const value = parseFloat(fallbackMatch[1].replace(',', '.'));
    const unit = fallbackMatch[2].toLowerCase();
    if (isValidUnit(unit)) return { value, unit };
  }

  // 4. Формат "1 кг (2x500г)" — пробуем вытащить из скобок
  const parenMatch = cleaned.match(/\((\d+(?:[.,]\d+)?)[x×*](\d+(?:[.,]\d+)?)[ ]*([а-яa-zA-Z.]+)\)/i);
  if (parenMatch) {
    const count = parseFloat(parenMatch[1].replace(',', '.'));
    const per = parseFloat(parenMatch[2].replace(',', '.'));
    const unit = parenMatch[3].toLowerCase();
    if (isValidUnit(unit)) return { value: count * per, unit };
  }

  // 5. Если ничего не подошло — null
  return null;
}
