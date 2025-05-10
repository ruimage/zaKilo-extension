import { getUnitParsedWeight, roundNumber, parseQuantityFromText } from "@/utils/converters";
import { ParserStrategy } from "@/core/ParserStrategy";
import type { UnitLabel } from "@/types/IStrategy";

export class AuchanStrategy extends ParserStrategy {
  constructor() {
    super('Auchan');
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

  parseQuantity(cardEl: HTMLElement): UnitLabel {
    const nameText = cardEl.querySelector(this.selectors.name)?.textContent?.trim() ?? "";
    const volumeText = this.selectors?.volume ? cardEl.querySelector(this.selectors.volume)?.textContent?.trim() ?? "" : "";
    let parsed = null;
    if (volumeText) {
      parsed = parseQuantityFromText(volumeText.toLowerCase().replace(/,/g, "."));
    }
    if (!parsed && nameText) {
      parsed = parseQuantityFromText(nameText.toLowerCase().replace(/,/g, "."));
    }
    if (!parsed) return { unitLabel: '1 шт', multiplier: 1 };
    return getUnitParsedWeight(parsed.value, parsed.unit);
  }

  renderUnitPrice(cardEl: HTMLElement, unitPrice: number, unitLabel: string): void {
    const wrapper = cardEl.querySelector(this.selectors.price)?.closest("div");
    if (!wrapper) throw new Error("Wrapper not found");

    const fz = "calc(0.95vw)";

    wrapper.style.fontSize = fz;
    // @ts-expect-error
    wrapper.parentElement.style.fontSize = fz;

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
