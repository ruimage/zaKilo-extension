
export class ParserStrategy {

    strategyName;
    selectors

    getCardSelector() {
        if (!this.selectors.card) throw new Error('card selector not defined');
        return this.selectors.card;
    }

    process(cardEl){
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

    _parsePrice(priceString){
        throw new Error(`_parsePrice not implemented from ${this.strategyName}`);
    }
    _parseQuantity(volumeQuantityString){
        throw new Error(`_parseQuantity not implemented from ${this.strategyName}`);
    }
    _renderUnitPrice(text){
        throw new Error(`_renderUnitPrice not implemented from ${this.strategyName}`);
    }

    shouldProcess(cardEl){
        throw new Error(`shouldProcess not implemented from ${this.strategyName}`);
    }
}
