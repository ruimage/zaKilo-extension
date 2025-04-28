import {BaseParser} from "../parsers/BaseParser";
import {AuchanStrategy} from "../parsers/AuchanStrategy";


(function boot() {
    const parser = new BaseParser(new AuchanStrategy());
        parser.init();
})();
