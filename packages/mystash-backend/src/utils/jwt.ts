import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Callback, Context } from "aws-lambda";
import { createHmac } from "crypto";

const base64UrlEncode = (input: string): string => {
  return Buffer.from(input)
    .toString("base64") // Muunna base64:ksi
    .replace(/\+/g, "-") // Muuta "+" merkki "-"
    .replace(/\//g, "_") // Muuta "/" merkki "_"
    .replace(/=+$/, "")  // Poista padding
}

export const createJWT = (payload: Record<string, any>, secret: string): string => {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const signatureBase = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secret).update(signatureBase).digest("base64");
  const encodedSignature = base64UrlEncode(signature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

export const verifyJWT = (token: string, secret: string): string | null => {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.')
    const signatureBase = `${encodedHeader}.${encodedPayload}`

    const signature = createHmac("sha256", secret!).update(signatureBase).digest("base64")
    const validSignature = base64UrlEncode(signature);

    // Check if the provided signature matches the valid signature
    if (validSignature !== encodedSignature) {
      return null; // Invalid token
    }

    // Decode payload
    const decodedPayload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))
    return decodedPayload.id
}

export const jwtMiddleware = (handler: APIGatewayProxyHandler, secret: string): APIGatewayProxyHandler => {
  return async (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
    console.log('Lambda event:', JSON.stringify(event, null, 2));
    const authorization = event.headers.Authorization || event.headers.authorization

    // Check for the authorization header
    if (!authorization) {
      callback(null, {
        statusCode: 401,
        body: JSON.stringify({ message: 'Authorization header missing' }),
      });
      return;
    }

    // Split the token from the header
    const [_bearer, token] = authorization.split(" ")
    if (!_bearer || _bearer.toLowerCase() !== 'bearer' || !token) {
      callback(null, {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid Authorization header format' }),
      })
      return
    }

    // Verify the JWT
    let userId: string
    try {
      userId = verifyJWT(token, secret!)
      event.requestContext.authorizer = { userId } // Store userId in event for later use
    } catch (error) {
      callback(null, {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
      return
    }
    const result = await handler(event, context, callback)
    if (!result) {
      throw new Error('Handler did not return a result')
    }
    return result
  }
}