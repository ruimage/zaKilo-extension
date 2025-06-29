import { isNoneUnitLabel, isUnitLabel, type IStrategy, type NoneUnitLabel, type UnitLabel } from "@/types/IStrategy";

const isDev = import.meta.env.DEV;

export abstract class ParserStrategy implements IStrategy {
  public strategyName: string;
  public selectors: IStrategy["selectors"];

  protected constructor() {
    this.strategyName = "unknown";
    this.selectors = {
      card: "",
      price: "",
      name: "",
      unitPrice: "",
    };
  }

  public getCardSelector(): string {
    if (!this.selectors.card) throw new Error("card selector not defined");
    return this.selectors.card;
  }

  public shouldProcess(cardEl: HTMLElement): boolean {
    const selectorsSet = this.selectors?.card && this.selectors?.price && this.selectors?.name;

    if (!selectorsSet) {
      throw new Error(`selectors not set for ${this.strategyName} strategy`);
    }

    return Boolean(
      cardEl.querySelector(this.selectors.price!) &&
        cardEl.querySelector(this.selectors.name!) &&
        !cardEl.querySelector(this.selectors.unitPrice!),
    );
  }

  process(cardEl: HTMLElement): void {
    this.log("processing card", cardEl);
    const price = this.parsePrice(cardEl);
    this.log("parsed price", price);

    const parsedQuantity: UnitLabel | NoneUnitLabel = this.parseQuantity(cardEl);

    if (isNoneUnitLabel(parsedQuantity) ) {
      this.log("none information about quantity");
      this.renderNoneUnitPrice(cardEl);
    }

    if (isUnitLabel(parsedQuantity)) {
      const { unitLabel, multiplier } = parsedQuantity;
      this.log("parsed quantity", { unitLabel, multiplier });

      const unitPrice = price * multiplier;
      this.log("calculated unit price", unitPrice);
      this.renderUnitPrice(cardEl, unitPrice, unitLabel);
    }
  }

  log(...args: unknown[]): void {
    if (isDev) {
      console.log(`[${this.strategyName}]`, ...args);
    }
  }

  protected trySelector(
    cardEl: HTMLElement,
    selector: string,
    method: 'textContent' | 'getAttribute' = 'textContent',
    attribute?: string
  ): string {
    if (!selector) return '';
    
    const element = cardEl.querySelector(selector);
    if (!element) return '';
    
    if (method === 'getAttribute') {
      return element.getAttribute(attribute || 'title')?.trim() || '';
    }
    
    return element.textContent?.trim() || '';
  }

  protected trySelectors(
    cardEl: HTMLElement,
    configs: Array<{
      selector: string;
      method?: 'textContent' | 'getAttribute';
      attribute?: string;
    }>
  ): string {
    for (const config of configs) {
      const text = this.trySelector(
        cardEl,
        config.selector,
        config.method || 'textContent',
        config.attribute
      );
      if (text) return text;
    }
    return '';
  }

  protected tryCustomSelectors<T>(
    cardEl: HTMLElement,
    extractors: Array<(cardEl: HTMLElement) => T | null>
  ): T | null {
    for (const extractor of extractors) {
      const result = extractor(cardEl);
      if (result !== null) return result;
    }
    return null;
  }

  abstract parsePrice(cardEl: HTMLElement): number;
  abstract parseQuantity(cardEl: HTMLElement): UnitLabel | NoneUnitLabel;
  abstract renderUnitPrice(cardEl: HTMLElement, unitPrice: number, unitLabel: string): void;
  abstract renderNoneUnitPrice(cardEl: HTMLElement): void;
}
