import { ParserStrategy } from "@/core/ParserStrategy";
import type { NoneUnitLabel, UnitLabel } from "@/types/IStrategy";
import { getConvertedUnit, roundNumber } from "@/utils/converters";

export class DeliveryClubStrategy extends ParserStrategy {
  constructor() {
    super();
    this.strategyName = "DeliveryClub";
    this.selectors = {
      card: ['li[data-carousel-item="true"]', 'li.DesktopGoodsList_item', ".DesktopGoodsList_list li", 'div[data-testid="product-card-root"]'].join(
        ",",
      ),
      price: '.p1jdj7iy span',
      name: '.nsawvb6',
      unitPrice: '[data-testid="product-card-unit-price"]',
      volume: '.wpsxpb7'
    };
  }

  parsePrice(cardEl: HTMLElement): number {
    const priceEl = cardEl.querySelector(this.selectors.price);
    const priceString = priceEl?.textContent;
    this.log("parsed price text", priceString);
    const cleaned = priceString?.replace(/\s| |&thinsp;/g, "").replace("₽", "") ?? "";
    const v = parseFloat(cleaned);
    if (isNaN(v)) throw new Error("Invalid price: " + priceString);
    return v;
  }

  parseQuantity(cardEl: HTMLElement): UnitLabel | NoneUnitLabel {
    const qtyText = this.trySelector(cardEl, this.selectors.volume as string);
    const s = qtyText.toLowerCase().replace(",", ".").trim();
    const m = s.match(/([\d.]+)\s*([^\s\d]+)/);
    if (!m) throw new Error("Invalid quantity: " + qtyText);
    const num = parseFloat(m[1]);
    const unit = m[2];
    return getConvertedUnit(num, unit);
  }

  renderUnitPrice(cardEl: HTMLElement, unitPrice: number, unitLabel: string): void {
    const priceEl = cardEl.querySelector(this.selectors.price);
    if (!priceEl) throw new Error("Price element not found");

    const wrapper = priceEl.closest('div[aria-hidden="true"]');
    if (!wrapper) throw new Error("Wrapper not found");

    // Ищем уже существующий unitPrice-бейдж
    const existingUnitPrice = wrapper.querySelector('[data-testid="unit-price"]') as HTMLElement | null;

    const formattedText = `${roundNumber(unitPrice, 0)}\u2009₽ за ${unitLabel}`;

    if (existingUnitPrice) {
      existingUnitPrice.textContent = formattedText;
      return;
    }

    const span = document.createElement("span");
    span.className = priceEl.className;
    span.setAttribute("data-testid", "unit-price");
    span.textContent = formattedText;

    Object.assign(span.style, {
      color: "#000",
      backgroundColor: "rgba(0, 198, 106, 0.1)",
      padding: "2px 6px 2px 0.5px",
      borderRadius: "0.25em",
      fontWeight: "500",
    });

    wrapper.appendChild(span);
  }

  renderNoneUnitPrice(cardEl: HTMLElement): void {
    const priceEl = cardEl.querySelector(this.selectors.price);
    if (!priceEl) throw new Error("Price element not found");

    const wrapper = priceEl.closest('div[aria-hidden="true"]');
    if (!wrapper) throw new Error("Wrapper not found");

    // Ищем уже существующий unitPrice-бейдж
    const existingUnitPrice = wrapper.querySelector('[data-testid="unit-price"]') as HTMLElement | null;

    if (existingUnitPrice) {
      existingUnitPrice.textContent = "Нет инф.";
      return;
    }

    const span = document.createElement("span");
    span.className = priceEl.className;
    span.setAttribute("data-testid", "unit-price");
    span.textContent = "Нет инф.";

    Object.assign(span.style, {
      color: "#000",
      backgroundColor: "var(--accent-color,rgba(0, 69, 198, 0.13))",
      padding: "2px 6px 2px 0.5px",
      borderRadius: "0.25em",
      fontWeight: "500",
    });

    wrapper.appendChild(span);
  }
}
