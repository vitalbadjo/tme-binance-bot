"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.db = void 0;
var sequelize_1 = require("sequelize");
var utils_1 = require("./utils");
exports.db = new sequelize_1.Sequelize({
    // database: "bnnc",
    // username: "root",
    // password: "root",
    // host: "188.246.228.236",
    // port: 6432,
    // dialect: "postgres"
    database: (0, utils_1.getEnv)("DB_NAME"),
    username: (0, utils_1.getEnv)("DB_USER"),
    password: (0, utils_1.getEnv)("DB_PASS"),
    host: (0, utils_1.getEnv)("DB_HOST"),
    port: parseInt((0, utils_1.getEnv)("DB_PORT")),
    dialect: "postgres",
});
exports.User = exports.db.define("user", {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true },
    chatId: { type: sequelize_1.DataTypes.STRING, unique: true }
});
