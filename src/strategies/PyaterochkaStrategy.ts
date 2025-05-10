import { ParserStrategy } from "@/core/ParserStrategy";
import { getUnitParsedWeight, roundNumber, parseQuantityFromText } from "@/utils/converters";
import type { UnitLabel } from "@/types/IStrategy";

enum Selectors {
  CARD = '[data-qa^="product-card-"], [class*="productFilterGrid_cardContainer"]',
  PRICE = '[class*="priceContainer_totalContainer_"]',
  DISCOUNT_PRICE = '[class*="priceContainer_discountContainer"]',
  NAME = '[class*="mainInformation_weight"]',
  UNIT_PRICE = '[data-testid="unit-price"]',
  VOLUME = '[class*="mainInformation_volume"]'
}

export class PyaterochkaStrategy extends ParserStrategy {
  constructor() {
    super('Pyaterochka');
    this.selectors = {
      card: Selectors.CARD,
      price: Selectors.PRICE,
      discountPrice: Selectors.DISCOUNT_PRICE,
      name: Selectors.NAME,
      unitPrice: Selectors.UNIT_PRICE,
      volume: Selectors.VOLUME
    };
  }

  parsePrice(cardEl: HTMLElement): number {
    const discountPriceString = this.selectors?.discountPrice
      ? cardEl.querySelector(this.selectors.discountPrice)?.textContent || ""
      : "";
    const regularPriceString = this.selectors?.price
      ? cardEl.querySelector(this.selectors.price)?.textContent || ""
      : "";

    const priceString = discountPriceString || regularPriceString;

    this.log("parsed price text", priceString);
    const priceRegex = /(?<!\d)([0-9]+(?:[ \u00A0][0-9]{3})*(?:[.,][0-9]+)?)[ \u00A0]*₽/u;

    const match = priceString?.match(priceRegex);
    if (!match) {
      throw new Error("Цена не распознана: " + priceString);
    }

    const textPrice = match[1].replace(/[ \u00A0]/g, "").replace(",", ".");

    const value = parseFloat(textPrice);
    if (isNaN(value)) {
      throw new Error("Цена не распознана: " + priceString);
    }

    const kopeckInRuble = 100;
    return value / kopeckInRuble;
  }

  parseQuantity(cardEl: HTMLElement): UnitLabel {
    const nameText = cardEl.querySelector(this.selectors.name)?.textContent?.trim() ?? "";
    const volumeText = this.selectors?.volume ? cardEl.querySelector(this.selectors.volume)?.textContent?.trim() ?? "" : "";
    const quantityString = nameText || volumeText;
    const s = quantityString.trim().toLowerCase().replace(/,/g, ".");
    const mulMatch = s.match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*([^\s\d]+)/i);
    let total: number;
    let unit: string;
    if (mulMatch) {
      const count = parseFloat(mulMatch[1]);
      const per = parseFloat(mulMatch[2]);
      unit = mulMatch[3];
      total = count * per;
      return getUnitParsedWeight(total, unit);
    } else {
      const parsed = parseQuantityFromText(s);
      if (!parsed) throw new Error(`не распознано количество: "${quantityString}"`);
      return getUnitParsedWeight(parsed.value, parsed.unit);
    }
  }

  renderUnitPrice(cardEl: HTMLElement, unitPrice: number, unitLabel: string): void {
    const wrapper = cardEl.querySelector(this.selectors.price)?.closest("div");
    if (!wrapper) throw new Error("Не найден элемент для отображения цены");

    const fz = "calc(0.95vw)";

    wrapper.style.fontSize = fz;
    // @ts-expect-error неизвестно наличие стилей
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
    wrapper.append(span);
  }
}
