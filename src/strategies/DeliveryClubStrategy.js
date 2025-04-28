import { ParserStrategy } from "../core/ParserStrategy";

export class DeliveryClubStrategy extends ParserStrategy {
  constructor() {
    super();
    this.strategyName = 'DeliveryClub';
    this.selectors = {
      card:      [
        'li[data-carousel-item="true"]',
        '.DesktopGoodsList_list li',
        'div[data-testid="product-card-root"]'
      ].join(','),
      price:     '[data-testid="product-card-price"]',
      name:      '[data-testid="product-card-weight"]',
      unitPrice: '[data-testid="product-card-unit-price"]'
    };
  }

  shouldProcess(cardEl) {
    return (
      cardEl.querySelector(this.selectors.price) &&
      cardEl.querySelector(this.selectors.name) &&
      !cardEl.querySelector(this.selectors.unitPrice)
    );
  }

  _parsePrice(txt) {
    const cleaned = txt.replace(/\s|&thinsp;/g, '').replace('₽', '');
    const v       = parseFloat(cleaned);
    if (isNaN(v)) throw new Error('Invalid price: ' + txt);
    return v;
  }

  _parseQuantity(input) {
    const s = input.toLowerCase().replace(',', '.').trim();
    const m = s.match(/([\d.]+)\s*([^\s\d]+)/);
    if (!m) throw new Error('Invalid quantity: ' + input);
    const num  = parseFloat(m[1]);
    const unit = m[2];
    switch (unit) {
      case 'г':
      case 'гр': return { unitLabel: '1 кг', multiplier: 1000 / num };
      case 'кг':  return { unitLabel: '1 кг', multiplier: 1 / num };
      case 'мл':  return { unitLabel: '1 л',  multiplier: 1000 / num };
      case 'л':   return { unitLabel: '1 л',  multiplier: 1 / num };
      case 'шт':  return { unitLabel: '1 шт', multiplier: 1 / num };
      case 'шт.': return { unitLabel: '1 шт', multiplier: 1 / num };
      default:    throw new Error('Unknown unit: ' + unit);
    }
  }

  _renderUnitPrice(cardEl, unitPrice, unitLabel) {
    const priceEl = cardEl.querySelector(this.selectors.price);
    const wrapper = priceEl.closest('div[aria-hidden="true"]');
    if (!wrapper) throw new Error('Wrapper not found');

    // удалить старые
    wrapper.querySelectorAll(this.selectors.unitPrice)
      .forEach(el => el.remove());

    const span = document.createElement('span');
    span.className = priceEl.className;
    span.setAttribute('data-testid', 'product-card-unit-price');
    span.textContent = `${Math.ceil(unitPrice)}\u2009₽ за ${unitLabel}`;

    // стили
    Object.assign(span.style, {
      color: '#000',
      backgroundColor: 'rgba(0, 198, 106, 0.1)',
      padding: '2px 6px 2px 0.5px',
      borderRadius: '0.25em',
      fontWeight: '500'
    });

    wrapper.appendChild(span);
  }
}
