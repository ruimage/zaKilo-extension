import { ParserStrategy } from "../core/ParserStrategy";
import { getUnitParsedWeight } from "../utils/converters";

//TODO fix kuper selectors

export class KuperStrategy extends ParserStrategy {
  constructor() {
    super();
    this.name = "Kuper";
    this.selectors = {
      productCard: "div.ProductCard_root__zO_B9",
      priceNew:
        ".ProductCard_price__LnWjd .ProductCardPrice_accent__6BZDJ.CommonProductCard_priceText__S5e9l, .ProductCard_price__LnWjd .ProductCardPrice_price__zSwp0.CommonProductCard_priceText__S5e9l",
      volume: "div.ProductCard_volume__RHLb0",
      unitPrice: '[data-testid="unit-price"]',
      catalogContainer: "body",
    };
  }

  _parsePrice(txt) {
    const num = txt.replace(/[^\d,\.]/g, "").replace(",", ".");
    const v = parseFloat(num);
    if (isNaN(v)) throw new Error("Цена не распознана: " + txt);
    return v;
  }

  _parseQuantity(input) {
    const s = input.toLowerCase().replace(/,/g, ".").trim();
    const mulMatch = s.match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*([^\s\d]+)/i);
    let total, unit;
    if (mulMatch) {
      total = parseFloat(mulMatch[1]) * parseFloat(mulMatch[2]);
      unit = mulMatch[3];
    } else {
      const m = s.match(/([\d.]+)\s*([^\s\d]+)/);
      if (!m) throw new Error("Вес не распознан: " + input);
      total = parseFloat(m[1]);
      unit = m[2];
    }
    unit = unit.replace(/\.+$/, "");

    return getUnitParsedWeight(total, unit);
  }
}
