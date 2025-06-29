import { ParserStrategy } from "@/core/ParserStrategy";
import type { NoneUnitLabel, UnitLabel } from "@/types/IStrategy";
import { getConvertedUnit, roundNumber } from "@/utils/converters";
import { DOMHelper } from "@/utils/DOMHelper";

export class PerekrestokStrategy extends ParserStrategy {
  constructor() {
    super();
    this.strategyName = "Perekrestok";
    this.selectors = {
      card: "[data-testid=product-card-root], div.product-card",
      price: "[data-testid=product-card-price], div.price-new",
      name: "[data-testid=product-card-name], .product-card__title",
      volume: "[data-testid=product-card-weight]",
      unitPrice: "[data-testid='unit-price']",
    };
  }

  /**
   * Гибко ищет DOM-элемент с ценой, учитывая возможные изменения атрибутов.
   */
  private getPriceElement(cardEl: HTMLElement): HTMLElement | null {
    const candidates = [
      this.selectors.price,
      "[data-testid='product-price']",
      "[data-testid='product-card-price-primary']",
      "[data-testid*='price']",
      "span[class*='price']",
      "div[class*='price']",
    ];

    for (const sel of candidates) {
      if (!sel) continue;
      const el = cardEl.querySelector(sel);
      if (el) return el as HTMLElement;
    }
    return null;
  }

  /**
   * Гибко ищет DOM-элемент с весом/объёмом.
   */
  private getVolumeText(cardEl: HTMLElement): string {
    const candidates = [
      this.selectors.volume,
      "[data-testid='product-card-volume']",
      "[data-testid*='weight']",
      "[data-testid*='volume']",
    ];

    for (const sel of candidates) {
      if (!sel) continue;
      const txt = DOMHelper.trySelector(cardEl, sel);
      if (txt) return txt;
    }
    return "";
  }

  /**
   * Возвращает элемент с названием товара.
   */
  private getNameElement(cardEl: HTMLElement): HTMLElement | null {
    const candidates = [this.selectors.name, "a.product-card__title", "div.product-card__title"];

    for (const sel of candidates) {
      if (!sel) continue;
      const el = cardEl.querySelector(sel);
      if (el) return el as HTMLElement;
    }
    return null;
  }

  shouldProcess(cardEl: HTMLElement): boolean {
    return Boolean(this.getPriceElement(cardEl) && this.getNameElement(cardEl));
  }

  parsePrice(cardEl: HTMLElement): number {
    const priceString = this.getPriceElement(cardEl)?.textContent;
    this.log("parsed price text", priceString);
    const priceRegex = /(?<!\d)([0-9]{1,3}(?:[ \u00A0][0-9]{3})*(?:[.,][0-9]+)?)[ \u00A0]*₽/u;
    const match = priceString?.match(priceRegex);
    if (!match) {
      throw new Error("Цена не распознана: " + priceString);
    }

    const textPrice = match[1].replace(/[ \u00A0]/g, "").replace(",", ".");

    const value = parseFloat(textPrice);
    if (isNaN(value)) {
      throw new Error("Цена не распознана: " + priceString);
    }

    return value;
  }

  parseQuantity(cardEl: HTMLElement): UnitLabel | NoneUnitLabel {
    const quantityText = (() => {
      const v = this.getVolumeText(cardEl);
      if (v) return v;
      // fallback к имени
      const nameEl = this.getNameElement(cardEl);
      return nameEl?.textContent || "";
    })();

    const s = quantityText.trim().toLowerCase().replace(/,/g, ".");
    const mulMatch = s.match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*([^\s\d]+)/i);
    let total: number;
    let unit: string;
    if (mulMatch) {
      const count = parseFloat(mulMatch[1]);
      const per = parseFloat(mulMatch[2]);
      unit = mulMatch[3];
      total = count * per;
    } else {
      const m = s.match(/([\d.]+)\s*([^\s\d]+)/);
      if (!m) throw new Error(`не распознано количество: "${quantityText}"`);
      total = parseFloat(m[1]);
      unit = m[2];
    }
    return getConvertedUnit(total, unit);
  }

  renderUnitPrice(cardEl: HTMLElement, unitPrice: number, unitLabel: string): void {
    const wrapper = this.getPriceElement(cardEl)?.closest("div");
    if (!wrapper) throw new Error("Не найден элемент для отображения цены");

    const fz = "calc(0.95vw)";

    wrapper.style.fontSize = fz;
    // Set parent element font size if it exists
    if (wrapper.parentElement) {
      wrapper.parentElement.style.fontSize = fz;
    }

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

  renderNoneUnitPrice(cardEl: HTMLElement): void {
    const wrapper = this.getPriceElement(cardEl)?.closest("div");
    if (!wrapper) throw new Error("Не найден элемент для отображения цены");

    const fz = "calc(0.95vw)";

    wrapper.style.fontSize = fz;
    // Set parent element font size if it exists
    if (wrapper.parentElement) {
      wrapper.parentElement.style.fontSize = fz;
    }

    wrapper.querySelectorAll(this.selectors.unitPrice).forEach((el) => el.remove());

    const span = document.createElement("span");
    span.setAttribute("data-testid", "unit-price");
    span.textContent = "Нет инф.";
    Object.assign(span.style, {
      display: "inline-block",
      marginLeft: "0.5em",
      color: "#000",
      background: "var(--accent-color,rgba(0, 69, 198, 0.13))",
      padding: "2px 6px",
      borderRadius: "4px",
      fontWeight: "900",
      fontSize: fz,
    });
    wrapper.append(span);
  }
}
