import { getUnitParsedWeight } from "../utils/converters";
import { ParserStrategy } from "../core/ParserStrategy";

export class AuchanStrategy extends ParserStrategy {
  constructor() {
    super();
    this.strategyName = "Auchan";
    this.selectors = {
      card: '[class*="styles_productCard"][class*="styles_catalogListPage_item"]',
      price: '[class*="styles_productCardContentPanel_price"]',
      name: '[class*="styles_productCardContentPanel_name"]',
      unitPrice: '[data-testid="unit-price"]',
    };
  }

  _parsePrice(cardEl) {
    const priceString = cardEl.querySelector(this.selectors.price)?.textContent;
    console.log("parsed price text", priceString);
    const num = priceString.replace(/[^\d,\.]/g, "").replace(",", ".");
    const v = parseFloat(num);
    if (isNaN(v)) throw new Error("cannot parse price: " + priceString);
    return v;
  }

  _parseQuantity(cardEl) {
    const nameText = cardEl.querySelector(this.selectors.name)?.textContent.trim();
    const regex = /([\d.,]+)\s*(г|гр|кг|мл|л|шт)/i;
    const match = nameText.match(regex);
    if (!match) return { unitLabel: "1 шт", multiplier: 1 };
    const value = parseFloat(match[1].replace(",", "."));
    const unit = match[2].toLowerCase();
    return getUnitParsedWeight(value, unit);
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
