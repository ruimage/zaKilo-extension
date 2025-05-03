import { ParserStrategy } from "@/core/ParserStrategy";
import { getUnitParsedWeight, roundNumber } from "@/utils/converters";
import { UnitLabel } from "@/types/IStrategy";

export class KuperStrategy extends ParserStrategy {
  constructor() {
    super();
    this.strategyName = "Kuper";
    this.selectors = {
      card: "[class*=ProductCardGridLayout]",
      name: '[class*="ProductCard_title"]',
      volume: '[class*="volume"]',
      price: "[class*=priceText]",
      unitPrice: '[data-testid="unit-price"]',
    };
  }

  parsePrice(cardEl: HTMLElement): number {
    const priceString = cardEl.querySelector(this.selectors.price)?.textContent;
    const priceRegex = /(\d+,\d+)/;
    const match = priceString?.match(priceRegex);
    const textPrice = match ? match[1].replace(",", ".") : null;
    const v = parseFloat(textPrice ?? "");
    if (isNaN(v)) throw new Error("Цена не распознана: " + priceString);
    return v;
  }

  parseQuantity(cardEl: HTMLElement): UnitLabel {
    const nameText = cardEl.querySelector(this.selectors.name)?.textContent?.trim() ?? "";
    const weightRegex = /(\d+(?:,\d+)?)\s*([а-яА-Яa-zA-Z]+)/;
    const match = nameText.match(weightRegex);

    if (match) {
      const totalText = match[1].replace(",", ".");
      const total = Number(totalText);
      if (isNaN(total)) throw new Error("Неверный формат числа: " + totalText);
      const unit = match[2];

      this.log("totalText, total, unit", totalText, total, unit);
      return getUnitParsedWeight(total, unit);
    } else {
      throw new Error("Обьем не распознан.");
    }
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
