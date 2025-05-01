export interface IStrategy {
  strategyName: string;
  selectors: {
    card?: string;
    price?: string;
    name?: string;
    volume?: string;
    unitPrice?: string;
    catalogContainer?: string;
    observeContainer?: string;
  };
  parsePrice(priceString: string): number;
  parseQuantity(input: string): { unitLabel: string; multiplier: number };
  renderUnitPrice(cardEl: Element, unitPrice: string, unitLabel: string): void;
  getCardSelector(): string;
  shouldProcess(element: Element): boolean;
  log(...args: any[]): void;
  process(element: Element): void;
}
