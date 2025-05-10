import { getUnitParsedWeight, roundNumber } from "@/utils/converters";
import { ParserStrategy } from "@/core/ParserStrategy";
import { Unit } from "@/types/IStrategy";
import type { UnitLabel } from "@/types/IStrategy";

enum Selectors {
  CARD = '[class*="tile-root"]',
  PRICE = '[class*="tsHeadline500Medium"]',
  NAME = '[class*="tsBody500Medium"]',
  UNIT_PRICE = '[data-testid="unit-price"]'
}

export class OzonStrategy extends ParserStrategy {
  constructor() {
    super('Ozon');
    this.selectors = {
      card: Selectors.CARD,
      price: Selectors.PRICE,
      name: Selectors.NAME,
      unitPrice: Selectors.UNIT_PRICE
    };
  }

  parsePrice(cardEl: HTMLElement): number {
    const priceString = cardEl.querySelector(this.selectors.price)?.textContent;
    this.log("parsed price text", priceString);
    const num = priceString?.replace(/[^\d,.]/g, "").replace(",", ".") ?? "";
    const v = parseFloat(num);
    if (isNaN(v)) throw new Error("cannot parse price: " + priceString);
    return v;
  }

  parseQuantity(cardEl: HTMLElement): UnitLabel {
    const nameText = cardEl.querySelector(this.selectors.name)?.textContent?.trim() ?? "";
    const regex = /([\d.,]+)\s*(г|гр|кг|мл|л|шт)/i;
    const match = nameText.match(regex);
    if (!match) return { unitLabel: Unit.PIECE, multiplier: 1 };
    const value = parseFloat(match[1].replace(",", "."));
    const unit = match[2].toLowerCase();
    return getUnitParsedWeight(value, unit);
  }

  renderUnitPrice(cardEl: HTMLElement, unitPrice: number, unitLabel: string): void {
    const wrapper = cardEl.querySelector(this.selectors.price)?.closest("div");

    if (!wrapper) {
      throw new Error("wrapper for price not found");
    }

    const fz = "calc(0.95vw)";
    wrapper.style.fontSize = fz;
    // @ts-expect-error
    wrapper.parentElement.style.fontSize = fz;

    wrapper.querySelectorAll(this.selectors.unitPrice).forEach((el: Element) => el.remove());

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
