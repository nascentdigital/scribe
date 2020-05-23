"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
// class definition
var Log = /** @class */ (function () {
    function Log() {
    }
    Log.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.debug.apply(console, args);
    };
    return Log;
}());
exports.Log = Log;
//# sourceMappingURL=Log.js.map