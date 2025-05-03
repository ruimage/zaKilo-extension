import { BaseParser } from "../core/BaseParser";
import { KuperStrategy } from "../strategies";

(function (): void {
  const parser = new BaseParser(new KuperStrategy());
  parser.init();
})();
