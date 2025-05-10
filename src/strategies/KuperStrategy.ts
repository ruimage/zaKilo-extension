import { ParserStrategy } from "@/core/ParserStrategy";
import { getUnitParsedWeight, roundNumber, parseQuantityFromText } from "@/utils/converters";
import type { UnitLabel } from "@/types/IStrategy";

export class KuperStrategy extends ParserStrategy {
  constructor() {
    super('Kuper');
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

  parseQuantity(cardEl: HTMLElement): UnitLabel {
    const nameText = cardEl.querySelector(this.selectors.name)?.getAttribute("title") || "";
    const volumeText = this.selectors?.volume ? cardEl.querySelector(this.selectors.volume)?.textContent || "" : "";
    const volumeString = nameText || volumeText;
    this.log("volumeString", volumeText);
    this.log("nameText", nameText);

    const parsed = parseQuantityFromText(volumeString.trim().toLowerCase().replace(",", "."));
    if (!parsed) throw new Error("Обьем не распознан.");
    return getUnitParsedWeight(parsed.value, parsed.unit);
  }

  renderUnitPrice(cardEl: Element, unitPrice: number, unitLabel: string): void {
    const wrapper = cardEl.querySelector(this.selectors.price)?.closest("div");
    if (!wrapper) throw new Error("Wrapper not found");

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
