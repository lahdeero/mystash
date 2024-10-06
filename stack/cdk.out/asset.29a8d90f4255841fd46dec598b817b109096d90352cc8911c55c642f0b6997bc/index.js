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

// ../packages/mystash-backend/src/handlers/login.ts
var login_exports = {};
__export(login_exports, {
  handler: () => handler,
  loginHandler: () => loginHandler
});
module.exports = __toCommonJS(login_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var import_crypto2 = require("crypto");

// ../packages/mystash-backend/src/utils/jwt.ts
var import_crypto = require("crypto");
var base64UrlEncode = (input) => {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
var createJWT = (payload, secret) => {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureBase = `${encodedHeader}.${encodedPayload}`;
  const signature = (0, import_crypto.createHmac)("sha256", secret).update(signatureBase).digest("base64");
  const encodedSignature = base64UrlEncode(signature);
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
};

// ../packages/mystash-backend/src/handlers/login.ts
var client = new import_client_dynamodb.DynamoDBClient({});
var dynamoDb = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var iv = process.env.SECRET.slice(0, 16).split("").reverse().join("");
var noAccess = (body) => ({
  statusCode: 401,
  headers: { "content-type": "application/json; charset=utf-8" },
  body
});
var decryptData = (ciphertext, secret) => {
  const decipher = (0, import_crypto2.createDecipheriv)("aes-256-cbc", secret, iv);
  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
var loginHandler = async (event) => {
  const parsedBody = JSON.parse(event.body);
  if (!(parsedBody.email && parsedBody.password)) {
    return noAccess("Email and password are required");
  }
  const command = new import_lib_dynamodb.QueryCommand({
    TableName: process.env.USERS_TABLE_NAME,
    IndexName: "email-index",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": parsedBody.email
    }
  });
  const data = await dynamoDb.send(command);
  console.log("data", { ...data, password: "<REDACTED>" });
  const item = data.Items?.[0];
  const dbPassword = item.password;
  const invalidUserNameOrPassword = "Invalid username or password";
  if (!dbPassword) {
    return noAccess(invalidUserNameOrPassword);
  }
  let passwordCorrect;
  const secret = process.env.SECRET;
  try {
    passwordCorrect = decryptData(dbPassword, secret) === parsedBody.password;
  } catch (e) {
    console.error("Error decrypting password", e);
    passwordCorrect = false;
  }
  if (!passwordCorrect) {
    return noAccess(invalidUserNameOrPassword);
  }
  const firstName = item.firstName;
  const lastName = item.lastName;
  const email = item.email;
  const tier = item.tier;
  const payload = {
    id: item.id,
    firstName,
    lastName,
    email,
    tier,
    iat: Math.floor(Date.now() / 1e3),
    exp: Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 7
    // Expire after 1 week
  };
  const token = createJWT(payload, secret);
  const user = {
    firstName,
    lastName,
    tier: item.tier,
    email
  };
  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ token, user }, null, 2)
  };
};
var handler = loginHandler;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler,
  loginHandler
});
