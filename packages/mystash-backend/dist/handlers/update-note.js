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
exports.handler = void 0;
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
var jwt_1 = require("../utils/jwt");
var updateNoteHandler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, noteId, client, parsedBody, title, content, tags, queryCommand, data, note, updateExpression, command, result;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = event.requestContext.authorizer.userId;
                noteId = event.pathParameters.id;
                client = lib_dynamodb_1.DynamoDBDocumentClient.from(new client_dynamodb_1.DynamoDB({
                    region: process.env.REGION,
                }));
                parsedBody = JSON.parse(event.body);
                title = parsedBody.title, content = parsedBody.content, tags = parsedBody.tags;
                queryCommand = new lib_dynamodb_1.QueryCommand({
                    TableName: process.env.NOTES_TABLE_NAME,
                    KeyConditionExpression: "id = :id",
                    FilterExpression: "userId = :userId",
                    ExpressionAttributeValues: {
                        ":id": noteId,
                        ":userId": userId,
                    },
                });
                return [4 /*yield*/, client.send(queryCommand)];
            case 1:
                data = _b.sent();
                note = (_a = data.Items) === null || _a === void 0 ? void 0 : _a[0];
                if (!note || note.userId !== userId) {
                    return [2 /*return*/, {
                            statusCode: 404,
                            headers: { "content-type": "application/json; charset=utf-8" },
                            body: JSON.stringify({ message: "Note not found" }, null, 2),
                        }];
                }
                updateExpression = "\n      SET #title = :title,\n      #content = :content,\n      #tags = :tags,\n      #updatedAt = :updatedAt\n    ";
                command = new lib_dynamodb_1.UpdateCommand({
                    TableName: process.env.NOTES_TABLE_NAME,
                    Key: {
                        id: noteId
                    },
                    UpdateExpression: updateExpression.trim(),
                    ExpressionAttributeNames: {
                        '#title': 'title',
                        '#content': 'content',
                        '#tags': 'tags',
                        '#updatedAt': 'updatedAt',
                    },
                    ExpressionAttributeValues: {
                        ':title': title,
                        ':content': content,
                        ':tags': tags,
                        ':updatedAt': new Date().toISOString(),
                    },
                    ReturnValues: 'ALL_NEW',
                });
                return [4 /*yield*/, client.send(command)];
            case 2:
                result = _b.sent();
                return [2 /*return*/, {
                        statusCode: 200,
                        headers: { "content-type": "application/json; charset=utf-8" },
                        body: JSON.stringify(result.Attributes, null, 2),
                    }];
        }
    });
}); };
exports.handler = (0, jwt_1.jwtMiddleware)(updateNoteHandler, process.env.SECRET);
