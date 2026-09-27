import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'

export type AsyncApiHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
) => Promise<APIGatewayProxyResult>
