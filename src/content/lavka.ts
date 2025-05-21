import { LavkaStrategy } from "../strategies";
import { BaseParser } from "../core/BaseParser";

// автозапуск
(function boot(): void {
  const parser = new BaseParser(new LavkaStrategy());
  parser.init();
})();
