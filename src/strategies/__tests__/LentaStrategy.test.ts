import { describe } from "vitest";
import { LentaStrategy } from "@/strategies";
import { loadAllTestCards } from "../__test_data__/loadTestData";
import { roundNumber } from "@/utils/converters";

describe("LentaStrategy", () => {
  const strategy = new LentaStrategy();
  const testCards = loadAllTestCards("lenta");

  testCards.forEach((testCard: any, index: number) => {
    describe(`Card ${index + 1}`, () => {
      // Create a DOM element from the HTML in the test data
      const cardEl = document.createElement("div");
      cardEl.innerHTML = testCard.html;

      it("should parse price correctly", () => {
        const price = strategy.parsePrice(cardEl);
        expect(roundNumber(price, 1)).toBe(testCard.expectedParsedPrice);
      });

      it("should render unit price correctly", () => {
        const { price, label, styles: expectedStyles } = testCard.expectedUnitPrice;

        const calculatedPrice = testCard.expectedParsedPrice * testCard.expectedParsedQuantity.multiplier;
        strategy.renderUnitPrice(cardEl, calculatedPrice, label);

        const renderedUnitPrice = cardEl.querySelector('[data-testid="unit-price"]');
        expect(renderedUnitPrice).toBeTruthy();
        expect(renderedUnitPrice?.textContent).toBe(`${price}\u2009₽/${label}`);

        const styles = window.getComputedStyle(renderedUnitPrice as HTMLElement);

        // Check that all expected styles are applied
        Object.entries(expectedStyles).forEach(([property, value]) => {
          expect(styles[property as any]).toBe(value);
        });

        // Проверяем, что элемент находится между price и кнопкой
        const priceAndButtons = cardEl.querySelector(".price-and-buttons");
        const priceBlock = priceAndButtons?.querySelector(".product-price");
        const buttonBlock = priceAndButtons?.querySelector(".ng-star-inserted:has(lu-counter-first-add)");
        
        expect(priceBlock?.nextElementSibling).toBe(renderedUnitPrice);
        expect(renderedUnitPrice?.nextElementSibling).toBe(buttonBlock);
      });
    });
  });
});
