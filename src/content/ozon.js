import { OzonStrategy } from "../strategies";
import { BaseParser } from "../core/BaseParser";

(function boot() {
  const parser = new BaseParser(new OzonStrategy());
  parser.init();
})();
