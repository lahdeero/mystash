import { JSONSchemaType } from "ajv"
import { APIGatewayEvent } from "aws-lambda"

import { CurrentUser, UserTier } from "../types/types.js"
import { badRequest } from "./index.js"
import { validate } from "./validation.js"

export const getCurrentUser = (event: APIGatewayEvent): CurrentUser => {
  return {
    userId: event.requestContext.authorizer?.userId,
    tier: event.requestContext.authorizer?.tier,
  }
}

export const isHighTierUser = (currentUser: CurrentUser): boolean => {
  const { tier } = currentUser
  return [UserTier.Premium, UserTier.Admin].includes(tier)
}

export const parseJsonBody = <T extends object>(
  event: APIGatewayEvent,
  schema: JSONSchemaType<T>,
): T => {
  if (!event.body) {
    throw badRequest("Request body is required")
  }

  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(event.body);
  } catch (error) {
    console.error("Error parsing JSON body:", error)
    throw badRequest("Invalid JSON body");
  }

  const validateRequest = validate(schema);

  if (!validateRequest(parsedBody)) {
    const errors = validateRequest.errors
      ?.map((error) => {
        const path = error.instancePath || "body"
        return `${path}: ${error.message}`
      })
      .join(", ")

    throw badRequest(errors ?? "Invalid request body")
  }

  return parsedBody as T;
};