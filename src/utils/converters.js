export function getUnitParsedWeight(value, unit) {
  switch (unit) {
    case 'г': case 'гр': return { unitLabel: '1 кг', multiplier: 1000 / value };
    case 'кг':          return { unitLabel: '1 кг', multiplier: 1 / value };
    case 'мл':          return { unitLabel: '1 л',  multiplier: 1000 / value };
    case 'л':           return { unitLabel: '1 л',  multiplier: 1 / value };
    case 'шт': case 'шт.': return { unitLabel: '1 шт', multiplier: 1 / value };
    default: throw new Error('Неизвестная единица: ' + unit);
  }
}

