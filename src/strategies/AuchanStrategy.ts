import { ParserStrategy } from "@/core/ParserStrategy";
import type { NoneUnitLabel, UnitLabel } from "@/types/IStrategy";
import { getConvertedUnit, roundNumber } from "@/utils/converters";


export class AuchanStrategy extends ParserStrategy {
  constructor() {
    super();
    this.strategyName = "Auchan";
    this.selectors = {
      card: '[class*="styles_productCard"][class*="styles_catalogListPage_item"],div[class*=digi-product]',
      price: '[class*="styles_productCardContentPanel_price"],[class*=digi-product__price]',
      name: '[class*="styles_productCardContentPanel_name"],[class*=digi-product__label]',
      unitPrice: '[data-testid="unit-price"]',
      volume: '[class*="productCardContentPanel_type"]',
    };
  }

  parsePrice(cardEl: HTMLElement): number {
    const priceString = cardEl.querySelector(this.selectors.price)?.textContent;

    const num = priceString?.replace(/[^\d,.]/g, "").replace(",", ".") ?? "";
    const v = parseFloat(num);
    if (isNaN(v)) throw new Error("cannot parse price: " + priceString);
    return v;
  }

  parseQuantity(cardEl: HTMLElement): UnitLabel | NoneUnitLabel {
    const nameText = this.trySelectors(cardEl, [
      { selector: this.selectors.volume || '' },
      { selector: this.selectors.name || '' }
    ]);

    const regex = /([\d.,]+)\s*(г(?!од)|гр|кг|мл|л|шт)/i;
    const match = nameText.match(regex);
    if (!match) return { unitLabel: null, multiplier: null } as NoneUnitLabel;
    const value = parseFloat(match[1].replace(",", "."));
    const unit = match[2].toLowerCase();
    return getConvertedUnit(value, unit) as UnitLabel | NoneUnitLabel;
  }

  renderNoneUnitPrice(cardEl: HTMLElement): void {
    const wrapper = cardEl.querySelector(this.selectors.price)?.closest("div");
    if (!wrapper) throw new Error("Wrapper not found");

    const fz = "calc(0.95vw)";

    wrapper.style.fontSize = fz;
    // Set parent element font size if it exists
    if (wrapper.parentElement) {
      wrapper.parentElement.style.fontSize = fz;
    }

    wrapper.querySelectorAll(this.selectors.unitPrice).forEach((el) => el.remove());

    const span = document.createElement("span");
    span.setAttribute("data-testid", "unit-price");
    span.textContent = `Нет инф.`;
    Object.assign(span.style, {
      display: "inline-block",
      marginLeft: "0.5em",
      color: "#000",
      background: "var(--accent-color,rgba(0, 69, 198, 0.13))",
      padding: "2px 6px",
      borderRadius: "4px",
      fontWeight: "900",
      fontSize: fz,
    });
    wrapper.appendChild(span);
  }

  renderUnitPrice(cardEl: HTMLElement, unitPrice: number, unitLabel: string): void {
    const wrapper = cardEl.querySelector(this.selectors.price)?.closest("div");
    if (!wrapper) throw new Error("Wrapper not found");

    const fz = "calc(0.95vw)";

    wrapper.style.fontSize = fz;
    // Set parent element font size if it exists
    if (wrapper.parentElement) {
      wrapper.parentElement.style.fontSize = fz;
    }

    wrapper.querySelectorAll(this.selectors.unitPrice).forEach((el) => el.remove());

    const span = document.createElement("span");
    span.setAttribute("data-testid", "unit-price");
    span.textContent = `${roundNumber(unitPrice, 0)}\u2009₽ за ${unitLabel}`;
    Object.assign(span.style, {
      display: "inline-block",
      marginLeft: "0.5em",
      color: "#000",
      background: "var(--accent-color, #00C66A20)",
      padding: "2px 6px",
      borderRadius: "4px",
      fontWeight: "900",
      fontSize: fz,
    });
    wrapper.appendChild(span);
  }
}
