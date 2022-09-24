"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_CURRENCY_AMOUNT_FOR_CALCULATING = exports.CURRENCY_DELIMITER = exports.CONFIG = void 0;
exports.CONFIG = {
    binance: {
        apiBaseUrl: "https://api.binance.com",
        fapiBaseUrl: "https://fapi.binance.com",
    },
    paribu: {
        apiBaseUrl: "https://www.paribu.com",
    },
    bitexen: {
        apiBaseUrl: "https://www.bitexen.com/api/v1",
    },
    btcTurk: {
        apiBaseUrl: "https://www.btcturk.com",
    },
    koronaPay: {
        apiBaseUrl: "https://koronapay.com",
    },
    garantex: {
        apiBaseUrl: "https://garantex.io/api/v2",
        limitUstForBids: "100000",
    },
    deniz: {
        apiBaseUrl: "https://www.denizbank.com/api",
    },
    sheets: {
        apiBaseUrl: "https://sheets.googleapis.com/v4",
    },
};
exports.CURRENCY_DELIMITER = "/";
exports.BASE_CURRENCY_AMOUNT_FOR_CALCULATING = 100;
