"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_CURRENCY_AMOUNT_FOR_CALCULATING = exports.CURRENCY_DELIMITER = exports.CONFIG = void 0;
exports.CONFIG = {
    binance: {
        apiBaseUrl: "https://api.binance.com",
        fapiBaseUrl: "https://fapi.binance.com"
    },
    paribu: {
        apiBaseUrl: "https://www.paribu.com"
    },
    sheets: {
        apiBaseUrl: ""
    },
    bitexen: {
        apiBaseUrl: "https://www.bitexen.com/api/v1"
    },
    btcTurk: {
        apiBaseUrl: "https://www.btcturk.com"
    },
    koronaPay: {
        apiBaseUrl: "https://koronapay.com"
    }
};
exports.CURRENCY_DELIMITER = "/";
exports.BASE_CURRENCY_AMOUNT_FOR_CALCULATING = 100;
