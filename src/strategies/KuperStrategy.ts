import { ParserStrategy } from "@/core/ParserStrategy";
import type { NoneUnitLabel, UnitLabel } from "@/types/IStrategy";
import { getConvertedUnit, roundNumber } from "@/utils/converters";

export class KuperStrategy extends ParserStrategy {
  constructor() {
    super();
    this.strategyName = "Kuper";
    this.selectors = {
      card: "[class*=ProductCardGridLayout]",
      name: "[data-qa$=_title]",
      volume: "[data-qa$=_volume]",
      price: "[class*=priceText]",
      unitPrice: '[data-testid="unit-price"]',
    };
  }

  parsePrice(cardEl: HTMLElement): number {
    const priceString = cardEl.querySelector(this.selectors.price)?.textContent;
    const fallbackPriceRegex = /(\d+,\d+)/;
    const fallbackMatch = priceString?.match(fallbackPriceRegex);
    const fallbackTextPrice = fallbackMatch ? fallbackMatch[1].replace(",", ".") : null;
    const fallbackV = parseFloat(fallbackTextPrice ?? "");
    if (isNaN(fallbackV)) throw new Error("Цена не распознана: " + priceString);
    return fallbackV;
  }

  parseQuantity(cardEl: HTMLElement): UnitLabel | NoneUnitLabel {
    const volumeString = this.trySelectors(cardEl, [
      { selector: this.selectors.name || '', method: 'getAttribute', attribute: 'title' },
      { selector: this.selectors.volume || '' }
    ]);

    this.log("volumeString", volumeString);

    const s = volumeString.trim().toLowerCase().replace(",", ".");
    const match = s.match(/([\d]+(?:\.\d+)?)\s*(г|гр|кг|мл|л|шт)\.?/i);

    if (match) {
      const totalText = match[1].replace(",", ".");
      const total = Number(totalText);
      if (isNaN(total)) throw new Error("Неверный формат числа: " + totalText);
      const unit = match[2];

      this.log("Name: totalText, total, unit", totalText, total, unit);
      return getConvertedUnit(total, unit);
    } else {
      return { unitLabel: null, multiplier: null } as NoneUnitLabel;
    }
  }

  renderUnitPrice(cardEl: Element, unitPrice: number, unitLabel: string): void {
    const wrapper = cardEl.querySelector(this.selectors.price)?.closest("div");
    if (!wrapper) throw new Error("Wrapper not found");

    const fz = "calc(0.95vw)";

    wrapper.style.fontSize = fz;
    // Set parent element font size if it exists
    if (wrapper.parentElement) {
      wrapper.parentElement.style.fontSize = fz;
    }

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

  renderNoneUnitPrice(cardEl: Element): void {
    const wrapper = cardEl.querySelector(this.selectors.price)?.closest("div");
    if (!wrapper) throw new Error("Wrapper not found");

    const fz = "calc(0.95vw)";

    wrapper.style.fontSize = fz;
    // Set parent element font size if it exists
    if (wrapper.parentElement) {
      wrapper.parentElement.style.fontSize = fz;
    }

    wrapper.querySelectorAll(this.selectors.unitPrice).forEach((el: Element) => el.remove());

    const span = document.createElement("span");
    span.setAttribute("data-testid", "unit-price");
    span.textContent = "Нет инф.";
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
}
