import { SamokatStrategy } from "../strategies";
import { BaseParser } from "../core/BaseParser";

// Автозапуск
(function () {
  const parser = new BaseParser(new SamokatStrategy());
  parser.init();
})();
