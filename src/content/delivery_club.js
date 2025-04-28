import { DeliveryClubStrategy } from '../parsers/DeliveryClubStrategy';
import { BaseParser } from '../parsers/BaseParser';


// автозапуск
(function boot() {
    const parser = new BaseParser(new DeliveryClubStrategy());
    parser.init();
})();
