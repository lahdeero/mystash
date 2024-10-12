import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { createJWT } from "../utils/jwt"
import { noAccess } from "../utils/http"
import { decryptData } from "../utils/cryptography"

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
})
const dynamoDb = DynamoDBDocumentClient.from(client)

export const loginHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const parsedBody = JSON.parse(event.body)
  if (!(parsedBody?.email && parsedBody?.password)) {
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
  const dbPassword = item?.password
  const invalidUserNameOrPassword = "Invalid username or password"
  if (!dbPassword) {
    return noAccess(invalidUserNameOrPassword)
  }
  let passwordCorrect: boolean
  try {
    passwordCorrect = decryptData(dbPassword) === parsedBody.password
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
  const token = createJWT(payload, process.env.SECRET!)
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
