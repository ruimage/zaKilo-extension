import {BaseParser} from "../clases/BaseParser";
import {AuchanStrategy} from "../clases/AuchanStrategy";


(function boot() {
    const parser = new BaseParser(new AuchanStrategy());
        parser.init();
})();
