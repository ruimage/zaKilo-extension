import { AuchanStrategy } from "../strategies";
import { BaseParser } from "../core/BaseParser";

(function boot(): void {
  const parser = new BaseParser(new AuchanStrategy());
  parser.init();
})();
