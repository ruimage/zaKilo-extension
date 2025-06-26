import { roundNumber } from "@/utils/converters";
import { describe, expect, it } from "vitest";
import { MetroStrategy } from "@/strategies";
import cardKg from "../__test_data__/metro/card_kg.json";
import cardPieceGrams from "../__test_data__/metro/card_piece_grams.json";
import cardPieceGrams2 from "../__test_data__/metro/card_piece_grams_2.json";

/**
 * Creates a realistic HTML element for a Metro product card based on test data.
 * @param data - The product data object.
 * @returns An HTMLElement representing the product card.
 */
function createCardElement(data: any): HTMLElement {
  const el = document.createElement("div");
  el.className = "catalog-1-level-product-card product-card";
  el.setAttribute("data-sku", "12345");

  el.innerHTML = `
    <div class="product-card__content">
      <div class="product-card-photo">
        <a href="${data.url}" class="product-card-photo__link">
          <img src="${data.image}" alt="${data.name}" class="product-card-photo__image">
        </a>
        ${
          data.discount
            ? `<div class="product-card-photo__discount"><div class="product-discount">${data.discount}</div></div>`
            : ""
        }
      </div>
      <div class="catalog-1-level-product-card__prices-rating">
        <div class="product-unit-prices">
          <div class="product-unit-prices__actual-wrapper">
            <span class="product-price product-unit-prices__actual">
              <span class="product-price__sum">
                <span class="product-price__sum-rubles">${data.price}</span>
              </span>
              <span class="product-price__unit">${data.priceUnit}</span>
            </span>
          </div>
          ${
            data.oldPrice
              ? `<div class="product-unit-prices__old-wrapper">
                  <span class="product-price product-unit-prices__old">
                    <span class="product-price__sum">
                      <span class="product-price__sum-rubles">${data.oldPrice}</span>
                    </span>
                    <span class="product-price__unit">${data.priceUnit}</span>
                  </span>
                </div>`
              : ""
          }
        </div>
      </div>
      <div class="catalog-1-level-product-card__middle">
        <a href="${data.url}" class="product-card-name">
          <span class="product-card-name__text">${data.name}</span>
        </a>
      </div>
    </div>
  `;
  return el;
}

describe("MetroStrategy", () => {
  const strategy = new MetroStrategy();

  it("should not change the price for items already sold per kg", () => {
    const el = createCardElement(cardKg);
    const price = strategy.parsePrice(el);
    const { multiplier, unitLabel } = strategy.parseQuantity(el);
    const calculatedPrice = roundNumber(price * multiplier, 0);

    expect(calculatedPrice).toBe(2499);
    expect(unitLabel).toBe("1 кг");
  });

  it("should calculate unit price for items sold by piece with weight in grams", () => {
    const el = createCardElement(cardPieceGrams); // 769 ₽ for 600g
    const price = strategy.parsePrice(el);
    const { multiplier, unitLabel } = strategy.parseQuantity(el);
    const calculatedPrice = roundNumber(price * multiplier, 0);

    expect(calculatedPrice).toBe(1282);
    expect(unitLabel).toBe("1 кг");
  });

  it("should correctly calculate unit price for another piece-based item", () => {
    const el = createCardElement(cardPieceGrams2); // 2545 ₽ for 400g
    const price = strategy.parsePrice(el);
    const { multiplier, unitLabel } = strategy.parseQuantity(el);
    const calculatedPrice = roundNumber(price * multiplier, 0);

    expect(calculatedPrice).toBe(6363);
    expect(unitLabel).toBe("1 кг");
  });
});
