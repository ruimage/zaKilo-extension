// Автозапуск
import { MagnitStrategy } from '../strategies';
import { BaseParser } from '../core/BaseParser';

(function() {
    const parser = new BaseParser(new MagnitStrategy());
    parser.init();
})();
