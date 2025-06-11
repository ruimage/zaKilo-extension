import type { NoneUnitLabel, UnitLabel } from "@/types/IStrategy";

/**
 * Rounds a number to the specified number of decimal places
 */
export function roundNumber(value: number, decimalPlaces: number = 2): number {
  const factor = Math.pow(10, decimalPlaces);
  const rounded = Math.round(Math.abs(value) * factor) / factor;
  return value < 0 ? -rounded : rounded;
}

export function getUnitParsedWeight(value: number, unit: string): UnitLabel | NoneUnitLabel {
  if (value === 0) {
    return { unitLabel: null, multiplier: null } as NoneUnitLabel;
  }
  if (value < 0) {
    return { unitLabel: null, multiplier: null } as NoneUnitLabel;
  }
  switch (unit) {
    case "г":
    case "гр":
      return { unitLabel: "1 кг", multiplier: 1000 / value } as UnitLabel;
    case "кг":
      return { unitLabel: "1 кг", multiplier: 1 / value } as UnitLabel;
    case "мл":
      return { unitLabel: "1 л", multiplier: 1000 / value } as UnitLabel;
    case "л":
      return { unitLabel: "1 л", multiplier: 1 / value } as UnitLabel;
    case "шт":
    case "шт.":
      return { unitLabel: "1 шт", multiplier: 1 / value } as UnitLabel;
    default:
      return { unitLabel: null, multiplier: null } as NoneUnitLabel;
  }
  return normalizedUnit;
}

/**
 * Gets target unit information for a given measure
 * @throws {Error} If measure is unknown
 */
function getTargetUnitInfo(measure: ConverssionsMeasures): { target: TargetUnit; label: string } {
  const target = measureToTargetUnit[measure];

  if (!target) {
    throw new Error(ERROR_MESSAGES.UNKNOWN_MEASURE(measure));
  }
  if (!(target in targetUnitLabels)) {
    throw new Error(ERROR_MESSAGES.UNSUPPORTED_TARGET(target));
  }

  return {
    target: target as TargetUnit,
    label: targetUnitLabels[target as TargetUnit],
  };
}

/**
 * Converts each unit (штуки)
 */
function convertEachUnit(value: number): UnitLabel {
  return {
    unitLabel: targetUnitLabels.ea,
    multiplier: 1 / value,
  };
}

/**
 * Converts measurable units (mass, volume)
 */
function convertMeasurableUnit(value: number, unit: MeasurableUnit): UnitLabel {
  const desc = convert().describe(unit as Unit) as { measure: ConverssionsMeasures };
  const { target, label } = getTargetUnitInfo(desc.measure);

  const convertedValue = convert(value)
    .from(unit as Unit)
    .to(target as Unit);

  return {
    unitLabel: label,
    multiplier: 1 / convertedValue,
  };
}
