import { ParserStrategy } from "../core/ParserStrategy";
import { getUnitParsedWeight } from "../utils/converters";

export class PerekrestokStrategy extends ParserStrategy {
  constructor() {
    super();
    this.strategyName = "Perekrestok";
    this.selectors = {
      card: ".product-card",
      price: ".product-card__price",
      name: ".product-card__title",
      catalogContainer: ".catalog-page__content",
    };
  }

  shouldProcess(cardEl) {
    return cardEl.querySelector(this.selectors.price) && cardEl.querySelector(this.selectors.name);
  }

  _parsePrice(priceString) {
    const priceText = priceString.textContent.trim();
    const match = priceText.match(/(\d+)\s*₽/);
    if (!match) throw new Error("Не удалось распознать цену");
    return parseFloat(match[1]);
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
    const price = this._parsePrice(cardEl.querySelector(this.selectors.price));
    const rawUnit = unitPrice;
    let rounded;
    if (rawUnit < 20) {
      rounded = Math.round(rawUnit * 100) / 100;
    } else {
      rounded = Math.ceil(rawUnit);
    }
    const whole = Math.floor(rounded);
    const cents = Math.round((rounded - whole) * 100);

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "flex-start";

    const oldSpan = document.createElement("span");
    oldSpan.textContent = `${price.toFixed(2).replace(/\.00$/, "")}\u2009₽`;
    oldSpan.style.fontSize = "0.96em";
    oldSpan.style.color = "rgb(166, 166, 166)";

    const newSpan = document.createElement("span");
    newSpan.setAttribute("data-testid", "unit-price");
    const display = whole + cents / 100;
    newSpan.textContent = `${(display < 1 && display.toFixed(2)) || display}\u2009₽ за ${unitLabel}`;
    newSpan.style.display = "inline-block";
    newSpan.style.color = "rgb(0, 0, 0)";
    newSpan.style.backgroundColor = "rgb(230, 245, 239)";
    newSpan.style.padding = "2px 6px 2px 0px";
    newSpan.style.borderRadius = "4px";
    newSpan.style.fontWeight = "600";
    newSpan.style.fontSize = "18px";

    container.append(oldSpan, newSpan);
    const old = cardEl.querySelector(this.selectors.price);
    old.replaceWith(container);
  }
}
