import { ParserStrategy } from "../core/ParserStrategy";
import { getUnitParsedWeight } from "../utils/converters";

export class PerekrestokStrategy extends ParserStrategy {
  constructor() {
    super();
    this.strategyName = "Perekrestok";
    this.selectors = {
      card: "[class*=product-card]",
      price: "[class*=product-card__price]",
      name: "[class*=product-card__title]",
      unitPrice: "[data-testid='unit-price']",
      catalogContainer: "[class*=catalog-page__content]",
    };
  }

  shouldProcess(cardEl) {
    return cardEl.querySelector(this.selectors.price) && cardEl.querySelector(this.selectors.name);
  }

  _parsePrice(cardEl) {
    const priceString = cardEl.querySelector(this.selectors.price)?.textContent;
    console.log("parsed price text", priceString);
    const priceRegex = /(?<!\d)([0-9]{1,3}(?:[ \u00A0][0-9]{3})*(?:[.,][0-9]+)?)[ \u00A0]*₽/u;
    const match = priceString.match(priceRegex);
    if (!match) {
      throw new Error("Цена не распознана: " + priceString);
    }

    let textPrice = match[1].replace(/[ \u00A0]/g, "").replace(",", ".");

    const value = parseFloat(textPrice);
    if (isNaN(value)) {
      throw new Error("Цена не распознана: " + priceString);
    }

    return value;
  }

  _parseQuantity(cardEl) {
    const nameText = cardEl.querySelector(this.selectors.name)?.textContent.trim();
    const s = nameText.trim().toLowerCase().replace(/,/g, ".");
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
