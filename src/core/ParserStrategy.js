export class ParserStrategy {
  strategyName;
  selectors;

  getCardSelector() {
    if (!this.selectors.card) throw new Error("card selector not defined");
    return this.selectors.card;
  }

  process(cardEl) {
    this.log("processing card", cardEl);
    const price = this._parsePrice(cardEl);
    this.log("parsed price", price);

    const { unitLabel, multiplier } = this._parseQuantity(cardEl);
    this.log("parsed unitLabel, multiplier", unitLabel, multiplier);

    const unitPrice = Math.ceil(price * multiplier);
    this.log("calculated unit price", unitPrice);

    this._renderUnitPrice(cardEl, unitPrice, unitLabel);
  }
  log(...args) {
    console.log(`[${this.strategyName}]`, ...args);
  }

  _parsePrice(priceString) {
    throw new Error(`_parsePrice not implemented from ${this.strategyName}`);
  }
  _parseQuantity(volumeQuantityString) {
    throw new Error(`_parseQuantity not implemented from ${this.strategyName}`);
  }
  _renderUnitPrice(text) {
    throw new Error(`_renderUnitPrice not implemented from ${this.strategyName}`);
  }

  shouldProcess(cardEl) {
    const selectorsSet = this.selectors?.card && this.selectors?.price && this.selectors?.name;

    if (!selectorsSet) {
      throw new Error(`selectors not set for ${this.strategyName} strategy`);
    }

    return (
      cardEl.querySelector(this.selectors.price) &&
      cardEl.querySelector(this.selectors.name) &&
      !cardEl.querySelector(this.selectors.unitPrice)
    );
  }
}
