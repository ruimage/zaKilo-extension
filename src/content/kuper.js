import { CooperStrategy } from "../strategies";
import { BaseParser } from "../core/BaseParser";

(function () {
  const parser = new BaseParser(new CooperStrategy());
  parser.init();
})();
