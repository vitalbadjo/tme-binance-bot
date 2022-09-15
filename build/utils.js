"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = void 0;
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
