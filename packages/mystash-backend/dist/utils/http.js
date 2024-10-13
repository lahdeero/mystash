"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noAccess = void 0;
var noAccess = function (body) { return ({
    statusCode: 401,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: body,
}); };
exports.noAccess = noAccess;
