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
exports.handler = exports.registerHandler = void 0;
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
var uuid_1 = require("uuid");
var http_1 = require("../utils/http");
var cryptography_1 = require("../utils/cryptography");
var validation_1 = require("../utils/validation");
var client = new client_dynamodb_1.DynamoDBClient({
    endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
});
var checkEmailErrors = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var command, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!validation_1.emailPattern.test(email)) {
                    return [2 /*return*/, 'Invalid email format'];
                }
                command = new lib_dynamodb_1.QueryCommand({
                    TableName: process.env.USERS_TABLE_NAME,
                    IndexName: 'email-index',
                    KeyConditionExpression: 'email = :email',
                    ExpressionAttributeValues: {
                        ':email': email,
                    },
                });
                return [4 /*yield*/, client.send(command)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result.Items && result.Items.length > 0 ? 'Email already exists' : null];
        }
    });
}); };
var registerHandler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var parsedBody, firstName, lastName, email, password, emailErrors, encryptedPassword, command;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                parsedBody = JSON.parse(event.body);
                firstName = parsedBody.firstName, lastName = parsedBody.lastName, email = parsedBody.email, password = parsedBody.password;
                if (!(firstName && lastName && email && password)) {
                    return [2 /*return*/, (0, http_1.noAccess)('First name, last name , email and password are required')];
                }
                return [4 /*yield*/, checkEmailErrors(email)];
            case 1:
                emailErrors = _a.sent();
                if (emailErrors) {
                    return [2 /*return*/, (0, http_1.noAccess)(emailErrors)];
                }
                encryptedPassword = (0, cryptography_1.encryptData)(password);
                command = new lib_dynamodb_1.PutCommand({
                    TableName: process.env.USERS_TABLE_NAME,
                    Item: {
                        id: (0, uuid_1.v4)(),
                        email: email,
                        password: encryptedPassword,
                        firstName: firstName,
                        lastName: lastName,
                    },
                });
                return [4 /*yield*/, client.send(command)];
            case 2:
                _a.sent();
                return [2 /*return*/, {
                        statusCode: 201,
                        headers: { "content-type": "application/json; charset=utf-8" },
                        body: '',
                    }];
        }
    });
}); };
exports.registerHandler = registerHandler;
exports.handler = exports.registerHandler;
