# заКило Extension

Расширение для сравнения цены за единицу товара в каталоге популярных сервисов доставки.

### Установка и запуск

1. **Клонировать репозиторий и установить зависимости**:
   ```bash
   git clone https://github.com/ruimage/zaKilo-extension.git
   cd zaKilo-extension
   npm ci
   ```

3. **Сборка dev-пакетов**:
   - **Chrome**:
     ```bash
     npm run build:chrome
     ```
   - **Firefox**:
     ```bash
     npm run build:firefox
     ```

3. **Сборка продакшен-пакетов**:
    - **Chrome**:
      ```bash
      npm run pack:chrome
      ```
    - **Firefox**:
      ```bash
      npm run pack:firefox
      ```

4. **Установка в браузере**:
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
- `public/icons/` — иконки расширения
- `vite.config.mjs` — конфиг сборки
- `dist/` — dev сборки пакетов для установки
- `ext-dist/` — production сборки пакетов для установки

