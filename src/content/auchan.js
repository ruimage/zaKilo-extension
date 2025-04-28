import {AuchanStrategy} from "../strategies";
import { BaseParser } from "../core/BaseParser";


(function boot() {
    const parser = new BaseParser(new AuchanStrategy());
        parser.init();
})();
