"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptData = exports.encryptData = void 0;
var crypto_1 = require("crypto");
var iv = process.env.SECRET.slice(0, 16).split("").reverse().join("");
var secret = process.env.SECRET;
var encryptData = function (plaintext) {
    var cipher = (0, crypto_1.createCipheriv)("aes-256-cbc", secret, iv);
    var encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
};
exports.encryptData = encryptData;
var decryptData = function (ciphertext) {
    var decipher = (0, crypto_1.createDecipheriv)("aes-256-cbc", secret, iv);
    var decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};
exports.decryptData = decryptData;
