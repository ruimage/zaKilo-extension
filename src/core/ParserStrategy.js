export class ParserStrategy {
  strategyName;
  selectors;

  getCardSelector() {
    if (!this.selectors.card) throw new Error("card selector not defined");
    return this.selectors.card;
  }

  process(cardEl) {
    const priceText = cardEl.querySelector(this.selectors.price).textContent;
    const price = this._parsePrice(priceText);

    const nameText = cardEl.querySelector(this.selectors.name).textContent.trim();
    const { unitLabel, multiplier } = this._parseQuantity(nameText);

    const unitPrice = Math.ceil(price * multiplier);
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
