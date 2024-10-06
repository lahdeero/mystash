var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../packages/mystash-backend/src/handlers/create-note.ts
var create_note_exports = {};
__export(create_note_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(create_note_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");

// ../node_modules/uuid/dist/esm-node/rng.js
var import_crypto = __toESM(require("crypto"));
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    import_crypto.default.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

// ../node_modules/uuid/dist/esm-node/regex.js
var regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

// ../node_modules/uuid/dist/esm-node/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default = validate;

// ../node_modules/uuid/dist/esm-node/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).substr(1));
}
function stringify(arr, offset = 0) {
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var stringify_default = stringify;

// ../node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return stringify_default(rnds);
}
var v4_default = v4;

// ../packages/mystash-backend/src/utils/jwt.ts
var import_crypto2 = require("crypto");
var base64UrlEncode = (input) => {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
var verifyJWT = (token, secret) => {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
  const signatureBase = `${encodedHeader}.${encodedPayload}`;
  const signature = (0, import_crypto2.createHmac)("sha256", secret).update(signatureBase).digest("base64");
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

// ../packages/mystash-backend/src/handlers/create-note.ts
var createNoteHandler = async (event) => {
  const userId = event.requestContext.authorizer.userId;
  const client = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDB({
    region: process.env.REGION
  }));
  if (!event.body) {
    throw new Error("Event has no body!");
  }
  const parsedBody = JSON.parse(event.body);
  const { title, content, tags } = parsedBody;
  const item = {
    id: v4_default(),
    title,
    content,
    tags,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    userId
  };
  const command = new import_lib_dynamodb.PutCommand({
    TableName: process.env.NOTES_TABLE_NAME,
    Item: item
  });
  await client.send(command);
  return {
    statusCode: 201,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(item, null, 2)
  };
};
var handler = jwtMiddleware(createNoteHandler, process.env.SECRET);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
