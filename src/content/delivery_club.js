import { DeliveryClubStrategy } from '../strategies';
import { BaseParser } from '../core/BaseParser';


// автозапуск
(function boot() {
    const parser = new BaseParser(new DeliveryClubStrategy());
    parser.init();
})();
