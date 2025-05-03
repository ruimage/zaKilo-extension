import { describe, it, expect } from "vitest";
import { AuchanStrategy } from "./AuchanStrategy";
import { loadAllTestCards } from "./__test_data__/loadTestData";
import { roundNumber } from "@/utils/converters";

describe("AuchanStrategy", () => {
  const strategy = new AuchanStrategy();
  const testCards = loadAllTestCards("auchan");

  testCards.forEach((testCard, index) => {
    describe(`Card ${index + 1}`, () => {
      // Create a DOM element from the HTML in the test data
      const cardEl = document.createElement("div");
      cardEl.innerHTML = testCard.html;

      it("should parse price correctly", () => {
        const price = strategy.parsePrice(cardEl);
        expect(roundNumber(price, 1)).toBe(testCard.expectedPrice);
      });

      it("should parse quantity correctly", () => {
        const quantity = strategy.parseQuantity(cardEl);
        expect(roundNumber(quantity.multiplier, 3)).toEqual(testCard.expectedQuantity.multiplier);
        expect(quantity.unitLabel).toEqual(testCard.expectedQuantity.unitLabel);
      });

      it("should render unit price correctly", () => {
        const { price, label, styles: expectedStyles } = testCard.expectedUnitPrice;

        strategy.renderUnitPrice(cardEl, price, label);

        const renderedUnitPrice = cardEl.querySelector('[data-testid="unit-price"]');
        expect(renderedUnitPrice).toBeTruthy();
        expect(renderedUnitPrice?.textContent).toBe(`${price}\u2009₽ за ${label}`);

        const styles = window.getComputedStyle(renderedUnitPrice as HTMLElement);

        // Check that all expected styles are applied
        Object.entries(expectedStyles).forEach(([property, value]) => {
          expect(styles[property as any]).toBe(value);
        });
      });
    });
  });
});
