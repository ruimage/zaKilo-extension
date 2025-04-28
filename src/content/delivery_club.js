class DeliveryProductCard {
  // селекторы и константы (также работает на Яндекс Еда)
  static CARD_SELECTOR = [
    'li[data-carousel-item="true"]',
    ".DesktopGoodsList_list li",
    'div[data-testid="product-card-root"]',
  ].join(",");
  static PRICE_SEL = '[data-testid="product-card-price"]';
  static WEIGHT_SEL = '[data-testid="product-card-weight"]';
  static UNIT_PRICE_SEL = '[data-testid="product-card-unit-price"]';

  static mutationObserver = null;
  static scrollHandler = null;
  static runAllInterval = null;

  static init() {
    DeliveryProductCard.log("=== ИНИЦИАЛИЗАЦИЯ DeliveryProductCard ===");
    DeliveryProductCard.runAll("init");
    DeliveryProductCard.setupMutationObserver();
    DeliveryProductCard.setupScrollListener();
    DeliveryProductCard.setupRunAllInterval(5000);
  }

  static log(...args) {
    console.log("[delivery-club]", ...args);
  }

  static runAll(source) {
    const nodes = Array.from(
      document.querySelectorAll(DeliveryProductCard.CARD_SELECTOR),
    );
    DeliveryProductCard.log(`${source}: найдено узлов=${nodes.length}`);
    const toProcess = nodes.filter(
      (el) =>
        el.querySelector(DeliveryProductCard.PRICE_SEL) &&
        el.querySelector(DeliveryProductCard.WEIGHT_SEL) &&
        !el.querySelector(DeliveryProductCard.UNIT_PRICE_SEL),
    );
    DeliveryProductCard.log(
      `${source}: карточек для обработки=${toProcess.length}`,
    );
    toProcess.forEach((el) => DeliveryProductCard.tryProcess(el, source));
  }

  static tryProcess(el, source) {
    const inst = new DeliveryProductCard(el);
    inst.log(`tryProcess [${source}]`);
    try {
      inst.process();
      inst.log(`✓ [${source}] успешно`);
    } catch (err) {
      inst.log(`✗ [${source}] ошибка:`, err.message);
    }
  }

  static setupMutationObserver() {
    const containers = Array.from(
      document.querySelectorAll(
        ".DesktopComponentsSlidedCarousel_listContainer, .DesktopGoodsList_list",
      ),
    );
    if (!containers.length) {
      DeliveryProductCard.log("setupMutationObserver: контейнеры не найдены");
      return;
    }
    const mo = new MutationObserver((muts) => {
      muts.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.matches(DeliveryProductCard.CARD_SELECTOR)) {
            DeliveryProductCard.log("MO: новая карточка", n);
            DeliveryProductCard.tryProcess(n, "MO");
          }
          n.querySelectorAll?.(DeliveryProductCard.CARD_SELECTOR).forEach(
            (el) => {
              DeliveryProductCard.log("MO: вложенная карточка", el);
              DeliveryProductCard.tryProcess(el, "MO");
            },
          );
        }),
      );
    });
    containers.forEach((c) =>
      mo.observe(c, { childList: true, subtree: true }),
    );
    DeliveryProductCard.mutationObserver = mo;
    DeliveryProductCard.log("setupMutationObserver: запущен");
  }

  static setupScrollListener() {
    const handler = DeliveryProductCard.debounce(() => {
      DeliveryProductCard.runAll("scroll");
    }, 300);
    window.addEventListener("scroll", handler, { passive: true });
    this.scrollHandler = handler;
    DeliveryProductCard.log("setupScrollListener: запущен");
  }

  static setupRunAllInterval(ms) {
    DeliveryProductCard.runAllInterval = setInterval(
      () => DeliveryProductCard.runAll("interval"),
      ms,
    );
    DeliveryProductCard.log(`setupRunAllInterval: каждые ${ms}ms`);
  }

  static debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  constructor(cardEl) {
    this.cardEl = cardEl;
    this.logPrefix = "[delivery-club]";
  }

  log(...args) {
    console.log(this.logPrefix, ...args);
  }

  process() {
    const { cardEl } = this;
    const priceSpan = cardEl.querySelector(DeliveryProductCard.PRICE_SEL);
    const weightEl = cardEl.querySelector(DeliveryProductCard.WEIGHT_SEL);
    if (!priceSpan || !weightEl) {
      throw new Error("priceSpan или weightEl не найдены");
    }

    const wrapper = priceSpan.closest('div[aria-hidden="true"]');
    if (!wrapper) {
      throw new Error('wrapper с aria-hidden="true" не найден');
    }

    const price = this._parsePriceText(priceSpan.textContent);
    this.log("price=", price);
    const weightText = weightEl.textContent.trim();
    this.log("weight=", weightText);
    const { name, multiplier } = this._parseQuantity(weightText);

    // округляем вверх до целого рубля
    const unitPriceRub = Math.ceil(price * multiplier);
    this.log("unitPriceRub (округл вверх)=", unitPriceRub);

    // удаляем старое
    wrapper
      .querySelectorAll(DeliveryProductCard.UNIT_PRICE_SEL)
      .forEach((el) => el.remove());

    // создаём новый
    const span = document.createElement("span");
    span.className = priceSpan.className;
    span.setAttribute("data-testid", "product-card-unit-price");
    span.textContent = `${unitPriceRub}\u2009₽ за ${name}`;

    // современные стили: черный текст, акцентный фон, padding и скругления
    span.style.color = "#000";
    span.style.backgroundColor = "rgba(0, 198, 106, 0.1)"; // нежный зеленый accent
    span.style.padding = "2px 6px 2px 0.5px";
    span.style.borderRadius = "0.25em";
    span.style.fontWeight = "500"; // чуть более выразительный текст

    wrapper.appendChild(span);
    this.log("unit-price appended");
  }

  _parsePriceText(txt) {
    const cleaned = txt.replace(/\s|&thinsp;/g, "").replace("₽", "");
    const v = parseFloat(cleaned);
    if (isNaN(v)) throw new Error("некорректная цена: " + txt);
    return v;
  }

  _parseQuantity(input) {
    const s = input.toLowerCase().replace(",", ".");
    const m = s.match(/([\d.]+)\s*([^\s\d]+)/);
    if (!m) throw new Error("некорректный вес: " + input);
    const num = parseFloat(m[1]),
      unit = m[2];
    switch (unit) {
      case "г":
        return { name: "1 кг", multiplier: 1000 / num };
      case "гр":
        return { name: "1 кг", multiplier: 1000 / num };
      case "кг":
        return { name: "1 кг", multiplier: 1 / num };
      case "мл":
        return { name: "1 л", multiplier: 1000 / num };
      case "л":
        return { name: "1 л", multiplier: 1 / num };
      case "шт":
        return { name: "1 шт", multiplier: 1 / num };
      case "шт.":
        return { name: "1 шт", multiplier: 1 / num };
      default:
        throw new Error("неизвестная единица: " + unit);
    }
  }
}

// автозапуск
(function boot() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      DeliveryProductCard.init(),
    );
  } else {
    DeliveryProductCard.init();
  }
})();
