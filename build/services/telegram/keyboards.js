"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyboards = exports.TELEGRAM = void 0;
exports.TELEGRAM = {
    commands: {
        DENIZ: "Deniz margin now",
        SWIFT: "SWIFT",
        KORONA: "KoronaPay",
        subscribe: "Subscribe",
        subscribeDeniz: "Подписатся на Deniz",
        subscribeKorona: "Подписатся на KoronaPay",
        backToMain: "Назад",
    },
};
exports.keyboards = {
    initial: {
        keyboard: [
            [{ text: exports.TELEGRAM.commands.DENIZ }],
            [{ text: exports.TELEGRAM.commands.SWIFT }],
            [{ text: exports.TELEGRAM.commands.KORONA }],
            [{ text: exports.TELEGRAM.commands.subscribe }],
        ],
    },
    subscriptions: {
        keyboard: [
            [{ text: exports.TELEGRAM.commands.subscribeDeniz }, { text: exports.TELEGRAM.commands.subscribeKorona }],
            [{ text: exports.TELEGRAM.commands.backToMain }],
        ],
    },
};
