export enum Unit {
  GRAM = "г",
  KILOGRAM = "кг",
  LITER = "л",
  PIECE = "шт"
}

export type UnitLabel = {
  unitLabel: Unit;
  multiplier: number;
};

export type Selectors = {
  card: string;
  price: string;
  discountPrice?: string;
  name: string;
  unitPrice: string;
  volume?: string;
  renderRoot?: string;
};

export type StrategyName =
  | 'Ozon'
  | 'Kuper'
  | 'Samokat'
  | 'Auchan'
  | 'DeliveryClub'
  | 'Magnit'
  | 'Perekrestok'
  | 'Pyaterochka';

export interface IStrategy {
  strategyName: StrategyName;
  selectors: Selectors;

  getCardSelector(): string;
  parsePrice(cardEl: Element): number;
  parseQuantity(cardEl: Element): UnitLabel;
  renderUnitPrice(cardEl: HTMLElement, unitPrice: number, unitLabel: string): void;
  shouldProcess(cardEl: HTMLElement): boolean;
  process(cardEl: HTMLElement): void;
  log(...args: unknown[]): void;
}
