"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtMiddleware = exports.verifyJWT = exports.createJWT = void 0;
var crypto_1 = require("crypto");
var base64UrlEncode = function (input) {
    return Buffer.from(input)
        .toString("base64") // Muunna base64:ksi
        .replace(/\+/g, "-") // Muuta "+" merkki "-"
        .replace(/\//g, "_") // Muuta "/" merkki "_"
        .replace(/=+$/, ""); // Poista padding
};
var createJWT = function (payload, secret) {
    var header = { alg: "HS256", typ: "JWT" };
    var encodedHeader = base64UrlEncode(JSON.stringify(header));
    var encodedPayload = base64UrlEncode(JSON.stringify(payload));
    var signatureBase = "".concat(encodedHeader, ".").concat(encodedPayload);
    var signature = (0, crypto_1.createHmac)("sha256", secret).update(signatureBase).digest("base64");
    var encodedSignature = base64UrlEncode(signature);
    return "".concat(encodedHeader, ".").concat(encodedPayload, ".").concat(encodedSignature);
};
exports.createJWT = createJWT;
var verifyJWT = function (token, secret) {
    var _a = token.split('.'), encodedHeader = _a[0], encodedPayload = _a[1], encodedSignature = _a[2];
    var signatureBase = "".concat(encodedHeader, ".").concat(encodedPayload);
    var signature = (0, crypto_1.createHmac)("sha256", secret).update(signatureBase).digest("base64");
    var validSignature = base64UrlEncode(signature);
    // Check if the provided signature matches the valid signature
    if (validSignature !== encodedSignature) {
        return null; // Invalid token
    }
    // Decode payload
    var decodedPayload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    return decodedPayload.id;
};
exports.verifyJWT = verifyJWT;
var jwtMiddleware = function (handler, secret) {
    return function (event, context, callback) { return __awaiter(void 0, void 0, void 0, function () {
        var authorization, _a, _bearer, token, userId, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Lambda event:', JSON.stringify(event, null, 2));
                    authorization = event.headers.Authorization || event.headers.authorization;
                    // Check for the authorization header
                    if (!authorization) {
                        callback(null, {
                            statusCode: 401,
                            body: JSON.stringify({ message: 'Authorization header missing' }),
                        });
                        return [2 /*return*/];
                    }
                    _a = authorization.split(" "), _bearer = _a[0], token = _a[1];
                    if (!_bearer || _bearer.toLowerCase() !== 'bearer' || !token) {
                        callback(null, {
                            statusCode: 401,
                            body: JSON.stringify({ message: 'Invalid Authorization header format' }),
                        });
                        return [2 /*return*/];
                    }
                    try {
                        userId = (0, exports.verifyJWT)(token, secret);
                        // TODO: Locally requestContext is undefined, works in AWS (without this condition)
                        if (!event.requestContext) {
                            event.requestContext = {};
                        }
                        event.requestContext.authorizer = { userId: userId }; // Store userId in event for later use
                        console.log('event.requestContext.authorizer:', event.requestContext.authorizer);
                    }
                    catch (error) {
                        callback(null, {
                            statusCode: 401,
                            body: JSON.stringify({ message: 'Unauthorized' }),
                        });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, handler(event, context, callback)];
                case 1:
                    result = _b.sent();
                    if (!result) {
                        throw new Error('Handler did not return a result');
                    }
                    return [2 /*return*/, result];
            }
        });
    }); };
};
exports.jwtMiddleware = jwtMiddleware;
