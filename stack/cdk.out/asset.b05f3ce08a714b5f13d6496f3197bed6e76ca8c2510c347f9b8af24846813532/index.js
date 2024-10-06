var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../packages/mystash-backend/src/handlers/get-notes.ts
var get_notes_exports = {};
__export(get_notes_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(get_notes_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");

// ../packages/mystash-backend/src/utils/jwt.ts
var import_crypto = require("crypto");
var base64UrlEncode = (input) => {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
var verifyJWT = (token, secret) => {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
  const signatureBase = `${encodedHeader}.${encodedPayload}`;
  const signature = (0, import_crypto.createHmac)("sha256", secret).update(signatureBase).digest("base64");
  const validSignature = base64UrlEncode(signature);
  if (validSignature !== encodedSignature) {
    return null;
  }
  const decodedPayload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  return decodedPayload.id;
};
var jwtMiddleware = (handler2, secret) => {
  return async (event, context, callback) => {
    console.log("Lambda event:", JSON.stringify(event, null, 2));
    const authorization = event.headers.Authorization || event.headers.authorization;
    if (!authorization) {
      callback(null, {
        statusCode: 401,
        body: JSON.stringify({ message: "Authorization header missing" })
      });
      return;
    }
    const [_bearer, token] = authorization.split(" ");
    if (!_bearer || _bearer.toLowerCase() !== "bearer" || !token) {
      callback(null, {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid Authorization header format" })
      });
      return;
    }
    let userId;
    try {
      userId = verifyJWT(token, secret);
      event.requestContext.authorizer = { userId };
    } catch (error) {
      callback(null, {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized" })
      });
      return;
    }
    const result = await handler2(event, context, callback);
    if (!result) {
      throw new Error("Handler did not return a result");
    }
    return result;
  };
};

// ../packages/mystash-backend/src/handlers/get-notes.ts
var getNotesHandler = async (event) => {
  const userId = event.requestContext.authorizer.userId;
  const client = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDB({
    region: process.env.REGION
  }));
  const command = new import_lib_dynamodb.QueryCommand({
    TableName: process.env.NOTES_TABLE_NAME,
    IndexName: "user-id-index",
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId
    }
  });
  const data = await client.send(command);
  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(data.Items, null, 2)
  };
};
var handler = jwtMiddleware(getNotesHandler, process.env.SECRET);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
