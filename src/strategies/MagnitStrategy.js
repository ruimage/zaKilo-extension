import { ParserStrategy } from "../core/ParserStrategy";

export class MagnitStrategy extends ParserStrategy {
  constructor() {
    super();
    this.strategyName = "Magnit";
    this.selectors = {
      card: '[class*="unit-catalog-product-preview"]',
      price: [
        '[class*="unit-catalog-product-preview-prices__sale"] span',
        '[class*="unit-catalog-product-preview-prices__regular"] span',
      ].join(","),
      name: '[class*="unit-catalog-product-preview-title"]',
      unitPrice: '[data-testid="unit-price"]',
    };
  }

  shouldProcess(cardEl) {
    return (
      cardEl.querySelector(this.selectors.price) &&
      cardEl.querySelector(this.selectors.name) &&
      !cardEl.querySelector(this.selectors.unitPrice)
    );
  }

  _parsePrice(txt) {
    const num = txt.replace(/[^\d.,]/g, "").replace(",", ".");
    const v = parseFloat(num);
    if (isNaN(v)) throw new Error("Cannot parse price: " + txt);
    return v;
  }

  _parseQuantity(text) {
    const s = text.trim().toLowerCase().replace(",", ".");
    const match = s.match(/([\d]+(?:\.\d+)?)\s*(г|гр|кг|мл|л|шт)\.?/i);
    if (!match) {
      return { unitLabel: "1 шт", multiplier: 1 };
    }
    //TODO исправить расчет цены по весу
    //https://magnit.ru/catalog/4834-moloko_syr_yaytsa?shopCode=992301&shopType=6
    const value = parseFloat(match[1]);
    const unit = match[2];
    let unitLabel, multiplier;
    switch (unit) {
      case "г":
      case "гр":
        unitLabel = "1 кг";
        multiplier = value / 1000;
        break;
      case "кг":
        unitLabel = "1 кг";
        multiplier = value;
        break;
      case "мл":
        unitLabel = "1 л";
        multiplier = value / 1000;
        break;
      case "л":
        unitLabel = "1 л";
        multiplier = value;
        break;
      case "шт":
      case "шт.":
        unitLabel = "1 шт";
        multiplier = value;
        break;
      default:
        unitLabel = `1 ${unit}`;
        multiplier = value;
    }
    return { unitLabel, multiplier };
  }

  _renderUnitPrice(cardEl, unitPrice, unitLabel) {
    const priceContainer = cardEl.querySelector('[class*="unit-catalog-product-preview-prices"]');
    if (!priceContainer) throw new Error("Price container not found");

    priceContainer.querySelectorAll(this.selectors.unitPrice).forEach((el) => el.remove());

    const displayValue = unitPrice < 20 ? unitPrice.toFixed(2) : Math.ceil(unitPrice).toString();

    const span = document.createElement("span");
    span.setAttribute("data-testid", "unit-price");
    span.textContent = `${displayValue}\u2009₽ за ${unitLabel}`;
    Object.assign(span.style, {
      display: "block",
      color: "rgb(0,0,0)",
      backgroundColor: "rgb(230,245,239)",
      padding: "2px 6px 2px 0.5px",
      borderRadius: "4px",
      fontWeight: "600",
      fontSize: "14px",
      marginBottom: "4px",
    });

    priceContainer.prepend(span);
  }
}
