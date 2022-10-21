"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firestore = exports.db = void 0;
var lite_1 = require("firebase/firestore/lite");
var app_1 = require("firebase/app");
exports.db = {};
var firebaseConfig = {
    apiKey: process.env.FBAPI,
    authDomain: "tme-bnb.firebaseapp.com",
    projectId: "tme-bnb",
    storageBucket: "tme-bnb.appspot.com",
    messagingSenderId: process.env.FBMSID,
    appId: process.env.FBAPID,
};
var firebaseController = (0, app_1.initializeApp)(firebaseConfig);
exports.firestore = (0, lite_1.getFirestore)(firebaseController);
