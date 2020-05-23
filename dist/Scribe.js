"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scribe = void 0;
var Log_1 = require("./Log");
// class definition
var Scribe = /** @class */ (function () {
    function Scribe() {
    }
    Scribe.getLog = function (namespace) {
        return new Log_1.Log();
    };
    return Scribe;
}());
exports.Scribe = Scribe;
//# sourceMappingURL=Scribe.js.map