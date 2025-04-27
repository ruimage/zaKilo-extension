import {getUnitParsedWeight} from "../utils/covertValues";
import {ParserStrategy} from "./ParserStrategy";

export class AuchanStrategy extends ParserStrategy {
    constructor() {
        super();
        this.selectors = {
            card: 'div.styles_productCard__Qy_9h.styles_catalogListPage_item__NAAw9',
            price: '.styles_productCardContentPanel_price__MqlWB',
            name:  '.styles_productCardContentPanel_name__072Y7',
            unitPrice: '[data-testid="unit-price"]'
        };
    }

    getCardSelector() {
        return this.selectors.card;
    }

    shouldProcess(cardEl) {
        return cardEl.querySelector(this.selectors.price)
            && cardEl.querySelector(this.selectors.name)
            && !cardEl.querySelector(this.selectors.unitPrice);
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
        console.log('[Auchan]', ...args);
    }

    _parsePrice(txt) {
        const num = txt.replace(/[^\d,\.]/g, '').replace(',', '.');
        const v = parseFloat(num);
        if (isNaN(v)) throw new Error('cannot parse price: ' + txt);
        return v;
    }

    _parseQuantity(text) {
        const regex = /([\d.,]+)\s*(г|гр|кг|мл|л|шт)/i;
        const match = text.match(regex);
        if (!match) return { unitLabel: '1 шт', multiplier: 1 };
        const value = parseFloat(match[1].replace(',', '.'));
        const unit  = match[2].toLowerCase();
        return getUnitParsedWeight(value, unit);
    }

    _renderUnitPrice(cardEl, unitPrice, unitLabel) {
        const wrapper = cardEl
            .querySelector(this.selectors.price)
            .closest('div');
        const fz = 'calc(0.95vw)';

        wrapper.style.fontSize = fz;
        wrapper.parentElement.style.fontSize = fz;

        wrapper.querySelectorAll(this.selectors.unitPrice)
            .forEach(el => el.remove());

        const span = document.createElement('span');
        span.setAttribute('data-testid', 'unit-price');
        span.textContent = `${unitPrice}\u2009₽ за ${unitLabel}`;
        Object.assign(span.style, {
            display: 'inline-block',
            marginLeft: '0.5em',
            color: '#000',
            background: 'var(--accent-color, #00C66A20)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: '900',
            fontSize: fz
        });
        wrapper.appendChild(span);
    }
}
