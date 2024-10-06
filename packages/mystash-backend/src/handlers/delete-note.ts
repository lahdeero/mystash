import type { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { jwtMiddleware } from "../utils/jwt";

const deleteNoteHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const userId = event.requestContext.authorizer.userId
  const client: DynamoDBClient = DynamoDBDocumentClient.from(new DynamoDB({
    region: process.env.REGION,
  }));
  if (!event.pathParameters) {
    throw new Error('Event has no body!')
  }

  const noteId = event.pathParameters.id
  // check if note id belongs to user
  const queryCommand = new QueryCommand({
    TableName: process.env.NOTES_TABLE_NAME,
    KeyConditionExpression: "id = :id",
    FilterExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":id": noteId,
      ":userId": userId,
    },
  })
  const data = await client.send(queryCommand)
  const note = data.Items?.[0]
  if (!note || note.userId !== userId) {
    return {
      statusCode: 404,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ message: "Note not found" }, null, 2),
    }
  }

  const command = new DeleteCommand({
    TableName: process.env.NOTES_TABLE_NAME,
    Key: {
      id: noteId.toString()
    },
    ReturnValues: 'ALL_OLD',
  })
  const result = await client.send(command)
  console.log("result", result)
  return {
    statusCode: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(result.Attributes, null, 2),
  }
}

export const handler = jwtMiddleware(deleteNoteHandler, process.env.SECRET)
