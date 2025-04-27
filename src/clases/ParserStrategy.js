
export class ParserStrategy {
    getCardSelector() {}
    shouldProcess(cardEl){}
    process(cardEl){}
    log(...args){}
    _parsePrice(text){}
    _parseQuantity(text){}
    _renderUnitPrice(text){}
}
