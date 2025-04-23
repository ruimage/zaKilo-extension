class PerekrestokProductCard {
    // селекторы и константы для «Перекрёсток»
    static CARD_SELECTOR      = 'div.product-card-wrapper, div.product-card';
    static PRICE_NEW_SEL      = '.price-new';
    static WEIGHT_SEL         = '.product-card__size';
    static UNIT_PRICE_SEL     = '[data-testid="unit-price"]';
    static OBSERVE_CONTAINER  = '.catalog-content-group__list';

    static mutationObserver = null;
    static scrollHandler    = null;
    static runAllInterval   = null;

    static init() {
        PerekrestokProductCard.log('=== ИНИЦИАЛИЗАЦИЯ PerekrestokProductCard ===');
        PerekrestokProductCard.runAll('init');
        PerekrestokProductCard.watchMutations();
        PerekrestokProductCard.setupScrollListener();
        PerekrestokProductCard.setupRunAllInterval(5000);
    }

    static log(...args) {
        console.log('[perekrestok]', ...args);
    }

    static runAll(source) {
        const cards = Array.from(document.querySelectorAll(PerekrestokProductCard.CARD_SELECTOR));
        PerekrestokProductCard.log(`${source}: найдено карточек=${cards.length}`);
        cards
            .filter(el =>
                el.querySelector(PerekrestokProductCard.PRICE_NEW_SEL) &&
                el.querySelector(PerekrestokProductCard.WEIGHT_SEL) &&
                !el.querySelector(PerekrestokProductCard.UNIT_PRICE_SEL)
            )
            .forEach(el => PerekrestokProductCard.tryProcess(el, source));
    }

    static tryProcess(el, source) {
        const inst = new PerekrestokProductCard(el);
        inst.log(`tryProcess [${source}]`);
        try {
            inst.process();
            inst.log(`✓ [${source}] успешно`);
        } catch (err) {
            inst.log(`✗ [${source}] ошибка:`, err.message);
        }
    }

    static watchMutations() {
        const container = document.querySelector(PerekrestokProductCard.OBSERVE_CONTAINER);
        if (!container) {
            PerekrestokProductCard.log('watchMutations: контейнер не найден');
            return;
        }
        const mo = new MutationObserver(mutations => {
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;
                    if (node.matches(PerekrestokProductCard.CARD_SELECTOR)) {
                        PerekrestokProductCard.log('watchMutations: новая карточка', node);
                        PerekrestokProductCard.tryProcess(node, 'watchMutations');
                    }
                    node.querySelectorAll?.(PerekrestokProductCard.CARD_SELECTOR)
                        .forEach(el => {
                            PerekrestokProductCard.log('watchMutations: вложенная карточка', el);
                            PerekrestokProductCard.tryProcess(el, 'watchMutations');
                        });
                }
            }
        });
        mo.observe(container, { childList: true, subtree: true });
        PerekrestokProductCard.mutationObserver = mo;
        PerekrestokProductCard.log('watchMutations: запущен');
    }

    static setupScrollListener() {
        const handler = PerekrestokProductCard.debounce(() => {
            PerekrestokProductCard.runAll('scroll');
        }, 300);
        window.addEventListener('scroll', handler, { passive: true });
        PerekrestokProductCard.scrollHandler = handler;
        PerekrestokProductCard.log('setupScrollListener: запущен');
    }

    static setupRunAllInterval(ms) {
        PerekrestokProductCard.runAllInterval = setInterval(
            () => PerekrestokProductCard.runAll('interval'),
            ms
        );
        PerekrestokProductCard.log(`setupRunAllInterval: каждые ${ms}ms`);
    }

    static debounce(fn, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), wait);
        };
    }

    constructor(cardEl) {
        this.cardEl    = cardEl;
        this.logPrefix = '[perekrestok]';
    }

    log(...args) {
        console.log(this.logPrefix, ...args);
    }

    process() {
        const priceNewEl = this.cardEl.querySelector(PerekrestokProductCard.PRICE_NEW_SEL);
        const weightEl   = this.cardEl.querySelector(PerekrestokProductCard.WEIGHT_SEL);
        if (!priceNewEl || !weightEl) {
            throw new Error('priceNewEl или weightEl не найдены');
        }

        const wrapper = priceNewEl.parentElement;
        if (!wrapper) {
            throw new Error('wrapper для цены не найден');
        }

        // Применяем новые стили к родителю
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'flex-start';

        const price = this._parsePriceText(priceNewEl.textContent);
        this.log('price=', price);

        const weightText = weightEl.textContent.trim();
        this.log('weight=', weightText);
        const { name, multiplier } = this._parseQuantity(weightText);

        const unitRub = Math.ceil(price * multiplier);
        this.log('unitPriceRub=', unitRub);

        wrapper.querySelectorAll(PerekrestokProductCard.UNIT_PRICE_SEL)
            .forEach(el => el.remove());

        const span = document.createElement('span');
        span.setAttribute('data-testid', 'unit-price');
        span.textContent = `${unitRub}\u2009₽ за ${name}`;
        // Новые стили для добавленной цены
        span.style.display         = 'inline-block';
        span.style.color           = 'rgb(0, 0, 0)';
        span.style.backgroundColor = 'var(--accent-color, #00C66A20)';
        span.style.padding         = '2px 6px 2px 0px';
        span.style.borderRadius    = '4px';
        span.style.fontWeight      = '600';
        span.style.fontSize        = '24px';

        wrapper.appendChild(span);
        this.log('unit-price appended');
    }

    _parsePriceText(txt) {
        const numStr = txt.replace(/[^\d,\.]/g, '').replace(',', '.');
        const v = parseFloat(numStr);
        if (isNaN(v)) throw new Error('не удалось распарсить цену: ' + txt);
        return v;
    }

    _parseQuantity(input) {
        const s = input.toLowerCase().replace(',', '.');
        const m = s.match(/([\d.]+)\s*([^\s\d]+)/);
        if (!m) throw new Error('не удалось распарсить вес: ' + input);
        const num = parseFloat(m[1]), unit = m[2];
        switch (unit) {
            case 'г':  return { name: '1 кг', multiplier: 1000/num };
            case 'гр':  return { name: '1 кг', multiplier: 1000/num };
            case 'кг': return { name: '1 кг', multiplier: 1/num };
            case 'мл': return { name: '1 л',  multiplier: 1000/num };
            case 'л':  return { name: '1 л',  multiplier: 1/num };
            case 'шт': return { name: '1 шт', multiplier: 1/num };
            case 'шт.': return { name: '1 шт', multiplier: 1 / num };
            default:   throw new Error('неизвестная единица: ' + unit);
        }
    }
}

// Автозапуск
(function boot() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PerekrestokProductCard.init());
    } else {
        PerekrestokProductCard.init();
    }
})();
