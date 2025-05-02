import { ParserStrategy } from "../core/ParserStrategy";
import { getUnitParsedWeight } from "../utils/converters";

export class PyaterochkaStrategy extends ParserStrategy {
  constructor() {
    super();
    this.strategyName = "Pyaterochka";
    this.selectors = {
      card: '[data-qa^="product-card-"], [class*="productFilterGrid_cardContainer"]',
      price: '[class*="priceContainer_priceContainerCatalog"]',
      name: '[class*="mainInformation_weight"]',
      unitPrice: '[data-testid="unit-price"]',
      catalogContainer: '[class*="catalogPage_container"]',
    };
  }

  _parsePrice(priceString) {
    const priceRegex = /(?<!\d)([0-9]+(?:[ \u00A0][0-9]{3})*(?:[.,][0-9]+)?)[ \u00A0]*₽/u;

    const match = priceString.match(priceRegex);
    if (!match) {
      throw new Error("Цена не распознана: " + priceString);
    }

    let textPrice = match[1].replace(/[ \u00A0]/g, "").replace(",", ".");

    const value = parseFloat(textPrice);
    if (isNaN(value)) {
      throw new Error("Цена не распознана: " + priceString);
    }

    const kopeyekInRuble = 100;
    return value / kopeyekInRuble;
  }

  _parseQuantity(input) {
    const s = input.trim().toLowerCase().replace(/,/g, ".");
    const mulMatch = s.match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*([^\s\d]+)/i);
    let total;
    let unit;
    if (mulMatch) {
      const count = parseFloat(mulMatch[1]);
      const per = parseFloat(mulMatch[2]);
      unit = mulMatch[3];
      total = count * per;
    } else {
      const m = s.match(/([\d.]+)\s*([^\s\d]+)/);
      if (!m) throw new Error(`не распознано количество: "${input}"`);
      total = parseFloat(m[1]);
      unit = m[2];
    }
    return getUnitParsedWeight(total, unit);
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
    wrapper.append(span);
  }
}

export default PyaterochkaStrategy;
