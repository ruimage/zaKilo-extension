class MagnitProductCard {
  static CARD_SELECTOR = ".unit-catalog-product-preview";
  static PRICE_NORMAL_SEL =
    ".unit-catalog-product-preview-prices__regular span";
  static PRICE_SALE_SEL = ".unit-catalog-product-preview-prices__sale span";
  static TITLE_SEL = ".unit-catalog-product-preview-title";
  static UNIT_PRICE_SEL = '[data-testid="unit-price"]';
  static OBSERVE_CONTAINER = ".unit-catalog";

  static init() {
    MagnitProductCard.log("=== ИНИЦИАЛИЗАЦИЯ MagnitProductCard ===");
    MagnitProductCard.runAll("init");
    MagnitProductCard.watchMutations();
    MagnitProductCard.setupInterval(5000);
  }

  static log(...args) {
    console.log("[magnit]", ...args);
  }

  static runAll(source) {
    const cards = Array.from(
      document.querySelectorAll(MagnitProductCard.CARD_SELECTOR),
    );
    MagnitProductCard.log(source + ": найдено карточек=" + cards.length);
    cards
      .filter(
        (el) =>
          !el.querySelector(MagnitProductCard.UNIT_PRICE_SEL) &&
          el.querySelector(MagnitProductCard.TITLE_SEL) &&
          (el.querySelector(MagnitProductCard.PRICE_NORMAL_SEL) ||
            el.querySelector(MagnitProductCard.PRICE_SALE_SEL)),
      )
      .forEach((el) => MagnitProductCard.tryProcess(el, source));
  }

  static tryProcess(el, source) {
    MagnitProductCard.log("tryProcess [" + source + "]", el);
    try {
      new MagnitProductCard(el).process();
      MagnitProductCard.log("✓ [" + source + "] успешно");
    } catch (err) {
      MagnitProductCard.log("✗ [" + source + "] ошибка:", err.message);
    }
  }

  static watchMutations() {
    const container = document.querySelector(
      MagnitProductCard.OBSERVE_CONTAINER,
    );
    if (!container)
      return MagnitProductCard.log("watchMutations: контейнер не найден");
    const mo = new MutationObserver((muts) => {
      muts.forEach((m) => {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.matches(MagnitProductCard.CARD_SELECTOR))
            MagnitProductCard.tryProcess(n, "watchMutations");
          n.querySelectorAll(MagnitProductCard.CARD_SELECTOR).forEach((el) =>
            MagnitProductCard.tryProcess(el, "watchMutations"),
          );
        });
      });
    });
    mo.observe(container, { childList: true, subtree: true });
    MagnitProductCard.log("watchMutations: запущен");
  }

  static setupInterval(ms) {
    setInterval(() => MagnitProductCard.runAll("interval"), ms);
  }

  constructor(cardEl) {
    this.cardEl = cardEl;
  }

  process() {
    const titleEl = this.cardEl.querySelector(MagnitProductCard.TITLE_SEL);
    const title = titleEl ? titleEl.textContent.trim() : "";
    const { unitLabel, multiplier } = this._parseQuantityFromName(title);

    const normEl = this.cardEl.querySelector(
      MagnitProductCard.PRICE_NORMAL_SEL,
    );
    if (!normEl) throw new Error("Цена не найдена");
    const priceTxtElement = normEl.textContent;
    const price = this._parsePriceText(priceTxtElement);

    const raw = price * multiplier;
    const unitValue = raw < 20 ? Math.round(raw * 100) / 100 : Math.ceil(raw);
    const display = raw < 20 ? unitValue.toFixed(2) : unitValue;

    const priceContainer = this.cardEl.querySelector(
      ".unit-catalog-product-preview-prices",
    );
    if (!priceContainer) throw new Error("price container not found");
    priceContainer
      .querySelectorAll(MagnitProductCard.UNIT_PRICE_SEL)
      .forEach((e) => e.remove());

    const span = document.createElement("span");
    span.setAttribute("data-testid", "unit-price");
    span.textContent = `${display}\u2009₽ за ${unitLabel}`;
    Object.assign(span.style, {
      display: "block",
      color: "rgb(0,0,0)",
      backgroundColor: "rgb(230,245,239)",
      padding: "2px 6px 2px 0.5px",
      borderRadius: "4px",
      fontWeight: "600",
      fontSize: "14px",
      marginBottom: "4px",
    });
    priceContainer.prepend(span);
  }

  _parsePriceText(txt) {
    const num = txt.replace(/[^\d.,]/g, "").replace(",", ".");
    const v = parseFloat(num);
    if (isNaN(v)) throw new Error("Не распознана цена: " + txt);
    return v;
  }

  _parseQuantityFromName(text) {
    // Ищем число (возможно с десятичной точкой/comma) и единицу без обязательного пробела
    const regex = /([\d]+(?:[.,]\d+)?)\s*(г|гр|кг|мл|л|шт)\.?/i;
    const match = text.match(regex);
    if (!match) {
      return { unitLabel: "1 шт", multiplier: 1 };
    }
    const value = parseFloat(match[1].replace(",", "."));
    const unit = match[2].toLowerCase();
    switch (unit) {
      case "г":
      case "гр":
        return { unitLabel: "1 кг", multiplier: 1000 / value };
      case "кг":
        return { unitLabel: "1 кг", multiplier: 1 / value };
      case "мл":
        return { unitLabel: "1 л", multiplier: 1000 / value };
      case "л":
        return { unitLabel: "1 л", multiplier: 1 / value };
      case "шт":
        return { unitLabel: "1 шт", multiplier: 1 / value };
      default:
        return { unitLabel: `1 ${unit}`, multiplier: 1 / value };
    }
  }
}

// Автозапуск
(function () {
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", () =>
      MagnitProductCard.init(),
    );
  else MagnitProductCard.init();
})();
