import { SamberiStrategy } from "../strategies";
import { BaseParser } from "../core/BaseParser";

// автозапуск
(function boot(): void {
  const parser = new BaseParser(new SamberiStrategy());
  parser.init();
})();
