import { BaseParser } from "@/core/BaseParser";
import { PyaterochkaStrategy } from "@/strategies";

(function boot(): void {
  const parser = new BaseParser(new PyaterochkaStrategy());
  parser.init();
})();
