import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { createHmac, createDecipheriv } from "crypto"
import { createJWT, verifyJWT } from "../utils/jwt"

const client = new DynamoDBClient({})
const dynamoDb = DynamoDBDocumentClient.from(client)
const iv = process.env.SECRET.slice(0,16).split("").reverse().join("")

const noAccess = (body: string) => ({
  statusCode: 401,
  headers: { "content-type": "application/json; charset=utf-8" },
  body,
})

// Salaa data AES:llä
// const encryptData = (plaintext: string): string => {
//   const cipher = createCipheriv("aes-256-cbc", process.env.SECRET, iv)
//   let encrypted = cipher.update(plaintext, "utf8", "hex")
//   encrypted += cipher.final("hex")
//   return encrypted
// }

const decryptData = (ciphertext: string, secret: string): string => {
    const decipher = createDecipheriv("aes-256-cbc", secret!, iv)
    let decrypted = decipher.update(ciphertext, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
}

export const loginHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const parsedBody = JSON.parse(event.body)
  if (!(parsedBody.email && parsedBody.password)) {
    return noAccess('Email and password are required')
  }
  const command = new QueryCommand({
    TableName: process.env.USERS_TABLE_NAME,
    IndexName: "email-index",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": parsedBody.email,
    },
  })
  const data = await dynamoDb.send(command)
  console.log("data", {...data, password: "<REDACTED>"})
  const item = data.Items?.[0]
  const dbPassword = item.password
  const invalidUserNameOrPassword = "Invalid username or password"
  if (!dbPassword) {
    return noAccess(invalidUserNameOrPassword)
  }
  let passwordCorrect: boolean
  const secret = process.env.SECRET!
  try {
    passwordCorrect = decryptData(dbPassword, secret) === parsedBody.password
  } catch (e) {
    console.error("Error decrypting password", e)
    passwordCorrect = false
  }
  if (!passwordCorrect) {
    return noAccess(invalidUserNameOrPassword)
  }
  const firstName = item.firstName
  const lastName = item.lastName
  const email = item.email
  const tier = item.tier
  const payload = {
    id: item.id,
    firstName,
    lastName,
    email,
    tier,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // Expire after 1 week
  }
  const token = createJWT(payload, secret)
  const user = {
    firstName,
    lastName,
    tier: item.tier,
    email
  }
  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ token, user }, null, 2),
  }
}

export const handler = loginHandler
