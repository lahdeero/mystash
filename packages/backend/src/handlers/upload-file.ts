import { APIGatewayEvent, Context, Callback, Handler } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'

import { FileInfo } from '../types/types.js'
import { exntensionToMimeType, jwtMiddleware } from '../utils/index.js'
import { FileService } from '../services/fileService.js'
import { getCurrentUser, isHighTierUser } from '../utils/utils.js'

const uploadFileHandler: Handler<APIGatewayEvent, any> = async (
  event: APIGatewayEvent,
  _context: Context,
  _callback: Callback
) => {
  const parsedBody = JSON.parse(event.body)
  const { title, fileName, noteId } = parsedBody
  const mimeType = exntensionToMimeType[fileName.split('.').pop()!]
  if (!noteId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing noteId' }),
    }
  }
  const currentUser = getCurrentUser(event)
  if (!mimeType && !isHighTierUser(currentUser)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid file extension' }),
    }
  }

  const id = uuidv4()
  const fileService = new FileService()
  try {
    const fileInfo: FileInfo = {
      id,
      fileName,
      mimeType,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      noteId,
      userId: event.requestContext.authorizer.userId,
    }
    await fileService.saveFileInfo(fileInfo)
    const uploadUrl = await fileService.getUploadUrl(currentUser, fileInfo)
    const body = {
      uploadUrl,
    }
    return {
      statusCode: 200,
      body: JSON.stringify(body),
    }
  } catch (error) {
    console.error('Error uploading file', error)
    await fileService.removeFileInfo(id)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error uploading file' }),
    }
  }
}

export const handler = jwtMiddleware(uploadFileHandler, process.env.SECRET!)
