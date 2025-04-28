
// Автозапуск
import { MagnitStrategy } from '../parsers/MagnitStrategy';
import { BaseParser } from '../parsers/BaseParser';

(function() {
    const parser = new BaseParser(new MagnitStrategy());
    parser.init();
})();
