"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPredefinedDataSheet = void 0;
var tslib_1 = require("tslib");
var axios_1 = tslib_1.__importDefault(require("axios"));
var config_1 = require("../config");
function getPredefinedDataSheet() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var response, data, jsonReady;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default
                        .create()
                        .get("".concat(config_1.CONFIG.sheets.apiBaseUrl, "/spreadsheets/").concat(process.env.GID, "/values/").concat(encodeURI("Sheet1!B5:K20"), "?key=").concat(process.env.GKEY))];
                case 1:
                    response = _a.sent();
                    data = response.data;
                    jsonReady = data.values.reduce(function (p, c, _, arr) {
                        var _a;
                        if (c[0] !== "null") {
                            return tslib_1.__assign(tslib_1.__assign({}, p), (_a = {}, _a[c[0]] = c.reduce(function (pr, cu, ind) {
                                var _a;
                                if (ind) {
                                    return tslib_1.__assign(tslib_1.__assign({}, pr), (_a = {}, _a[arr[0][ind]] = cu, _a));
                                }
                                return pr;
                            }, {}), _a));
                        }
                        return p;
                    }, {});
                    return [2 /*return*/, jsonReady];
            }
        });
    });
}
exports.getPredefinedDataSheet = getPredefinedDataSheet;
// Sheet1%21A1%3AF10
