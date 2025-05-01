import { ParserStrategy } from "../core/ParserStrategy";
import { getUnitParsedWeight } from "../utils/converters";

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

  _parsePrice(priceString) {
    const priceRegex = /(\d+,\d+)/;
    const match = priceString.match(priceRegex);
    const textPrice = match ? match[1].replace(",", ".") : null;
    const v = parseFloat(textPrice);
    if (isNaN(v)) throw new Error("Цена не распознана: " + priceString);
    return v;
  }

  _parseQuantity(volumeQuantityString) {
    const weightRegex = /(\d+(?:,\d+)?)\s*([а-яА-Яa-zA-Z]+)/;
    const match = volumeQuantityString.match(weightRegex);

    if (match) {
      const totalText = match[1].replace(",", ".");
      const total = isNaN(Number(totalText)) ? null : Number(totalText);
      const unit = match[2];

      this.log("totalText, total, unit", totalText, total, unit);
      return getUnitParsedWeight(total, unit);
    } else {
      throw new Error("Обьем не распознан.");
    }
  }

  _renderUnitPrice(cardEl, unitPrice, unitLabel) {
    const wrapper = cardEl.querySelector(this.selectors.price).closest("div");
    const fz = "calc(0.95vw)";

    wrapper.style.fontSize = fz;
    wrapper.parentElement.style.fontSize = fz;

    wrapper.querySelectorAll(this.selectors.unitPrice).forEach((el) => el.remove());

    const span = document.createElement("span");
    span.setAttribute("data-testid", "unit-price");
    span.textContent = `${unitPrice}\u2009₽ за ${unitLabel}`;
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
