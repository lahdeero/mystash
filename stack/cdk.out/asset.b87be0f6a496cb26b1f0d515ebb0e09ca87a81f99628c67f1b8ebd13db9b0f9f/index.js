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

// ../packages/mystash-backend/src/handlers/delete-note.ts
var delete_note_exports = {};
__export(delete_note_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(delete_note_exports);
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

// ../packages/mystash-backend/src/handlers/delete-note.ts
var deleteNoteHandler = async (event) => {
  const userId = event.requestContext.authorizer.userId;
  const client = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDB({
    region: process.env.REGION
  }));
  if (!event.pathParameters) {
    throw new Error("Event has no body!");
  }
  const noteId = event.pathParameters.id;
  const queryCommand = new import_lib_dynamodb.QueryCommand({
    TableName: process.env.NOTES_TABLE_NAME,
    KeyConditionExpression: "id = :id",
    FilterExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":id": noteId,
      ":userId": userId
    }
  });
  const data = await client.send(queryCommand);
  const note = data.Items?.[0];
  if (!note || note.userId !== userId) {
    return {
      statusCode: 404,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ message: "Note not found" }, null, 2)
    };
  }
  const command = new import_lib_dynamodb.DeleteCommand({
    TableName: process.env.NOTES_TABLE_NAME,
    Key: {
      id: noteId.toString()
    }
  });
  const result = await client.send(command);
  console.log("result", result);
  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(result.Attributes.id, null, 2)
  };
};
var handler = jwtMiddleware(deleteNoteHandler, process.env.SECRET);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
