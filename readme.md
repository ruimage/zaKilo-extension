# заКило Extension

Расширение для сравнения цены за единицу товара в каталоге популярных сервисов доставки.

### Установка и запуск

1. Клонировать репозиторий и установить зависимости:

   ```bash
   git clone https://github.com/ruimage/zaKilo-extension.git
   cd zaKilo-extension
   npm ci
   ```

2. Режим разработки с HMR

   Добавлен режим разработки с горячей перезагрузкой модулей (HMR). Для запуска локального сервера разработки выполните:

   - Chrome:
     ```bash
      npm run build:chrome
     ```
   - Firefox:
     ```bash
     npm run build:firefox
     ```

3. Сборка dev-пакетов:

   - Chrome:
     ```bash
     npm run build:chrome
     ```
   - Firefox:
     ```bash
     npm run build:firefox
     ```

4. Сборка продакшен-пакетов:

   - Chrome:
     ```bash
     npm run pack:chrome
     ```
   - Firefox:
     ```bash
     npm run pack:firefox
     ```

5. Установка в браузере:

   - **Chrome**:
     1. Открыть `chrome://extensions/`
     2. Включить «Режим разработчика»
     3. Нажать «Загрузить распакованное расширение» и указать папку `dist/chrome`
   - **Firefox**:
     1. Открыть `about:debugging#/runtime/this-firefox`
     2. Нажать «Load Temporary Add-on»
     3. Выбрать `dist/firefox/manifest.json`

### Структура проекта

- `manifests/` — шаблоны манифестов (base + per-browser)
- `src/`
  - `background/` — фоновые скрипты
  - `content/` — контент-скрипты
  - `core/` — базовые классы парсинга (BaseParser, ParserStrategy)
  - `strategies/` — реализации стратегий для сайтов
  - `utils/` — вспомогательные утилиты (конвертация единиц)
- `public/icons/` — иконки расширения
- `vite.config.mjs` — конфиг сборки
- `dist/` — dev-сборки пакетов для установки
- `ext-dist/` — production-сборки пакетов для установки

## Инструкция для контрибьюторов

Чтобы добавить поддержку нового сайта, выполните следующие шаги:

1. **Создать файл стратегии** в `src/strategies/ИмяСайтаStrategy.js` на основе шаблона:

   - Наследовать от `ParserStrategy`.
   - Указать `strategyName` и селекторы для элементов карточки.
   - Реализовать методы:
     - `_parsePrice(priceString)` — извлечение числового значения цены.
     - `_parseQuantity(volumeString)` — разбор объёма/количества.
     - `_renderUnitPrice(cardEl, unitPrice, unitLabel)` — отображение расчёта единичной цены.

2. **Зарегистрировать стратегию** в `src/strategies/index.js`:

   ```js
   export { default as ИмяСайтаStrategy } from "./ИмяСайтаStrategy";
   ```

3. **Создать контент-скрипт** `src/content/имясайта.js`:

   ```js
   import { ИмяСайтаStrategy } from "../strategies";
   import { BaseParser } from "../core/BaseParser";

   (function boot() {
     const parser = new BaseParser(new ИмяСайтаStrategy());
     parser.init();
   })();
   ```

4. **Добавить правило** в `src/background/background.js`:

   ```js
   [
     {
       match: ["*://*.домен.ру/*"],
       script: "src/content/имясайта.js",
     },
   ];
   ```

5. **Протестировать стратегию**, убедившись, что карточки обрабатываются корректно на целевом сайте.

6. **Добавить юнит-тесты** для методов стратегии и обновить документацию при необходимости.
