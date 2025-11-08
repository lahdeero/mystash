import {
  APIGatewayEvent,
  Context,
  Callback,
  Handler,
  APIGatewayProxyResult,
} from 'aws-lambda'

import { jwtMiddleware } from '../utils/index.js'
import { CurrentUser } from '../types/types.js'
import { FileService } from '../services/fileService.js'

const getNoteFiles: Handler<APIGatewayEvent, any> = async (
  event: APIGatewayEvent,
  _context: Context,
  _callback: Callback
): Promise<APIGatewayProxyResult> => {
  const noteId = event.pathParameters.id
  if (!noteId) {
    throw new Error('Missing noteId')
  }
  const currentUser: CurrentUser = {
    userId: event.requestContext.authorizer.userId,
    tier: event.requestContext.authorizer.tier,
  }
  const fileService = new FileService()
  const response = fileService.getFilesByNoteId(
    noteId,
    currentUser
  )
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(response, null, 2),
  }
}

export const handler = jwtMiddleware(getNoteFiles, process.env.SECRET!)
