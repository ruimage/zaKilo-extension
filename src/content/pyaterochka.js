import { BaseParser } from "../core/BaseParser";
import { PyaterochkaStrategy } from "../strategies";

(function boot() {
  const parser = new BaseParser(new PyaterochkaStrategy());
  parser.init();
})();
