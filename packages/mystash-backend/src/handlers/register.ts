import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { v4 as uuidv } from "uuid"
import { noAccess } from "../utils/http"
import { encryptData } from "../utils/cryptography"
import { emailPattern } from "../utils/validation"

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
})
const dynamoDb = DynamoDBDocumentClient.from(client)

const checkEmailErrors = async (email: string): Promise<string | null> => {
  if (!emailPattern.test(email)) {
    return 'Invalid email format'
  }
  const command = new QueryCommand({
    TableName: process.env.USERS_TABLE_NAME,
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
  })
  const result = await client.send(command)
  return result.Items && result.Items.length > 0 ? 'Email already exists' : null
}

export const registerHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const parsedBody = JSON.parse(event.body)
  const { firstName, lastName, email, password } = parsedBody
  if (!(firstName && lastName && email && password)) {
    return noAccess('First name, last name , email and password are required')
  }
  const emailErrors = await checkEmailErrors(email)
  if (emailErrors) {
    return noAccess(emailErrors)
  }

  // Create user
  const encryptedPassword = encryptData(password)
  const command = new PutCommand({
    TableName: process.env.USERS_TABLE_NAME,
    Item: {
      id: uuidv(),
      email,
      password: encryptedPassword,
      firstName,
      lastName,
    },
  })
  await dynamoDb.send(command)
  return {
    statusCode: 201,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: '',
  }
}

export const handler = registerHandler
