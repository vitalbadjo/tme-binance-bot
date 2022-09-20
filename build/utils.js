"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delaySec = exports.retry = exports.getEnv = void 0;
function getEnv(name) {
    var env = process.env[name];
    if (env) {
        return env;
    }
    else {
        throw new Error("Please provide ".concat(name, " variable in your .env file"));
    }
}
exports.getEnv = getEnv;
function retry(tryNum, delay, thunk) {
    return thunk().catch(function (error) {
        if (tryNum === 0) {
            throw error;
        }
        return delaySec(delay).then(function () { return retry(tryNum - 1, delay, thunk); });
    });
}
exports.retry = retry;
function delaySec(num) {
    return new Promise(function (r) { return setTimeout(r, num); });
}
exports.delaySec = delaySec;
