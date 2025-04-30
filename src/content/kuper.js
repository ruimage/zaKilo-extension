import { BaseParser } from "../core/BaseParser";
import { KuperStrategy } from "../strategies";

(function () {
  const parser = new BaseParser(new KuperStrategy());
  parser.init();
})();
