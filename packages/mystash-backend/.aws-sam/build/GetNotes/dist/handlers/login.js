"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.handler = exports.loginHandler = void 0;
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
var jwt_1 = require("../utils/jwt");
var http_1 = require("../utils/http");
var cryptography_1 = require("../utils/cryptography");
var client = new client_dynamodb_1.DynamoDBClient({
    endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
});
var dynamoDb = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
var loginHandler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedBody, command, data, item, dbPassword, invalidUserNameOrPassword, passwordCorrect, firstName, lastName, email, tier, payload, token, user;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                parsedBody = JSON.parse(event.body);
                if (!((parsedBody === null || parsedBody === void 0 ? void 0 : parsedBody.email) && (parsedBody === null || parsedBody === void 0 ? void 0 : parsedBody.password))) {
                    return [2 /*return*/, (0, http_1.noAccess)('Email and password are required')];
                }
                command = new lib_dynamodb_1.QueryCommand({
                    TableName: process.env.USERS_TABLE_NAME,
                    IndexName: "email-index",
                    KeyConditionExpression: "email = :email",
                    ExpressionAttributeValues: {
                        ":email": parsedBody.email,
                    },
                });
                return [4 /*yield*/, dynamoDb.send(command)];
            case 1:
                data = _b.sent();
                console.log("data", __assign(__assign({}, data), { password: "<REDACTED>" }));
                item = (_a = data.Items) === null || _a === void 0 ? void 0 : _a[0];
                dbPassword = item === null || item === void 0 ? void 0 : item.password;
                invalidUserNameOrPassword = "Invalid username or password";
                if (!dbPassword) {
                    return [2 /*return*/, (0, http_1.noAccess)(invalidUserNameOrPassword)];
                }
                try {
                    passwordCorrect = (0, cryptography_1.decryptData)(dbPassword) === parsedBody.password;
                }
                catch (e) {
                    console.error("Error decrypting password", e);
                    passwordCorrect = false;
                }
                if (!passwordCorrect) {
                    return [2 /*return*/, (0, http_1.noAccess)(invalidUserNameOrPassword)];
                }
                firstName = item.firstName;
                lastName = item.lastName;
                email = item.email;
                tier = item.tier;
                payload = {
                    id: item.id,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    tier: tier,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // Expire after 1 week
                };
                token = (0, jwt_1.createJWT)(payload, process.env.SECRET);
                user = {
                    firstName: firstName,
                    lastName: lastName,
                    tier: item.tier,
                    email: email
                };
                return [2 /*return*/, {
                        statusCode: 200,
                        headers: { "content-type": "application/json; charset=utf-8" },
                        body: JSON.stringify({ token: token, user: user }, null, 2),
                    }];
        }
    });
}); };
exports.loginHandler = loginHandler;
exports.handler = exports.loginHandler;
