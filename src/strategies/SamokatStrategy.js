import { ParserStrategy } from "../core/ParserStrategy";
import { getUnitParsedWeight } from "../utils/converters";

export class SamokatStrategy extends ParserStrategy {
  constructor() {
    super();
    this.strategyName = "Samokat";
    this.selectors = {
      card: "[class*=ProductCard_root]",
      price: "[class*=ProductCardActions_text] span span:last-child",
      name: "[class*=ProductCard_specification] span:first-child",
      unitPrice: '[data-testid="unit-price"]',
      details: "[class*=ProductCard_details]",
      observeContainer: ".swiper-wrapper",
    };
  }

  _parsePrice(cardEl) {
    const priceString = cardEl.querySelector(this.selectors.price)?.textContent;
    console.log("parsed price text", priceString);
    const num = priceString.replace(/[^\d,\.]/g, "").replace(",", ".");
    const v = parseFloat(num);
    if (isNaN(v)) throw new Error("Цена не распознана: " + priceString);
    return v;
  }

  _parseQuantity(cardEl) {
    let nameText;
    if (this.selectors?.volume) {
      nameText = cardEl.querySelector(this.selectors.volume)?.textContent.trim();
    } else {
      nameText = cardEl.querySelector(this.selectors.name)?.textContent.trim();
    }

    const s = nameText.toLowerCase().replace(/,/g, ".").trim();
    const mulMatch = s.match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*([^\s\d]+)$/i);
    let total;
    let unit;
    if (mulMatch) {
      const count = parseFloat(mulMatch[1]);
      const per = parseFloat(mulMatch[2]);
      unit = mulMatch[3];
      total = count * per;
    } else {
      // Обычный формат "число + единица"
      const m = s.match(/([\d.]+)\s*([^\s\d]+)/);
      if (!m) return { unitLabel: "1 шт", multiplier: 1 };
      total = parseFloat(m[1]);
      unit = m[2];
    }

    return getUnitParsedWeight(total, unit);
  }

  _renderUnitPrice(cardEl, unitPrice, unitLabel) {
    const details = cardEl.querySelector(this.selectors.details);
    if (!details) throw new Error("Не найдены необходимые элементы");

    const rawUnit = unitPrice;
    const calculatedUnitPrice = rawUnit < 20 ? Math.round(rawUnit * 100) / 100 : Math.ceil(rawUnit);
    const displayPrice = rawUnit < 20 ? calculatedUnitPrice.toFixed(2) : calculatedUnitPrice;

    // Удаляем старые
    details.querySelectorAll(this.selectors.unitPrice).forEach((e) => e.remove());

    const span = document.createElement("span");
    span.setAttribute("data-testid", "unit-price");
    span.textContent = `${displayPrice}\u2009₽ за ${unitLabel}`;
    Object.assign(span.style, {
      display: "inline-block",
      color: "#000",
      backgroundColor: "var(--accent-color, #00C66A20)",
      padding: "2px 6px",
      borderRadius: "4px",
      fontWeight: "600",
      fontSize: "15px",
    });
    details.appendChild(span);
  }
}
