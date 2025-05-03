import { BaseParser } from "../core/BaseParser";
import { PerekrestokStrategy } from "../strategies";

(function boot() {
  const parser = new BaseParser(new PerekrestokStrategy());
  parser.init();
})();
