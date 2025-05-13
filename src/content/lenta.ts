import { BaseParser } from "../core/BaseParser";
import { LentaStrategy } from "../strategies";

(function (): void {
  const parser = new BaseParser(new LentaStrategy());
  parser.init();
})();
