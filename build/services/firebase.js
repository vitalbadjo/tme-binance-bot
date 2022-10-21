"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
var tslib_1 = require("tslib");
var firebase_1 = require("../apis/firebase");
var lite_1 = require("firebase/firestore/lite");
var FirebaseService = /** @class */ (function () {
    function FirebaseService() {
        this.db = firebase_1.firestore;
    }
    FirebaseService.prototype.getAllUsers = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var usersCol, usersSnapshot, usersList;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        usersCol = (0, lite_1.collection)(this.db, "users");
                        return [4 /*yield*/, (0, lite_1.getDocs)(usersCol)];
                    case 1:
                        usersSnapshot = _a.sent();
                        usersList = usersSnapshot.docs.map(function (doc) { return doc.data(); });
                        return [2 /*return*/, usersList];
                }
            });
        });
    };
    FirebaseService.prototype.addUser = function (user) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var usersCol, newUser;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        usersCol = (0, lite_1.collection)(this.db, "users");
                        return [4 /*yield*/, (0, lite_1.addDoc)(usersCol, user)];
                    case 1:
                        newUser = _a.sent();
                        return [2 /*return*/, newUser.id];
                }
            });
        });
    };
    FirebaseService.prototype.getUser = function (userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var usersCol, usersSnapshot, userDocRef;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        usersCol = (0, lite_1.collection)(this.db, "users");
                        return [4 /*yield*/, (0, lite_1.getDocs)(usersCol)];
                    case 1:
                        usersSnapshot = _a.sent();
                        userDocRef = usersSnapshot.docs.find(function (doc) { return doc.data().id === userId; });
                        if (userDocRef) {
                            return [2 /*return*/, userDocRef.data()];
                        }
                        else {
                            console.log("User not found");
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    FirebaseService.prototype.updateUser = function (userId, newUserData) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var usersCol, usersSnapshot, userDocRef;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        usersCol = (0, lite_1.collection)(this.db, "users");
                        return [4 /*yield*/, (0, lite_1.getDocs)(usersCol)];
                    case 1:
                        usersSnapshot = _a.sent();
                        userDocRef = usersSnapshot.docs.find(function (doc) { return doc.data().id === userId; });
                        if (!userDocRef) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, lite_1.setDoc)(userDocRef.ref, tslib_1.__assign(tslib_1.__assign({}, userDocRef.data()), newUserData))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        console.log("User not found");
                        return [2 /*return*/, false];
                }
            });
        });
    };
    FirebaseService.prototype.deleteUser = function (id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var usersCol, usersSnapshot, userDocRef;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        usersCol = (0, lite_1.collection)(this.db, "users");
                        return [4 /*yield*/, (0, lite_1.getDocs)(usersCol)];
                    case 1:
                        usersSnapshot = _a.sent();
                        userDocRef = usersSnapshot.docs.find(function (doc) { return doc.data().id === id; });
                        if (!userDocRef) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, lite_1.deleteDoc)(userDocRef.ref)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        console.log("User not found");
                        return [2 /*return*/, false];
                }
            });
        });
    };
    return FirebaseService;
}());
exports.FirebaseService = FirebaseService;
