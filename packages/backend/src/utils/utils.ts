import { APIGatewayEvent } from "aws-lambda"

import { CurrentUser, UserTier } from "../types/types.js"

export const getCurrentUser = (event: APIGatewayEvent): CurrentUser => {
  return {
    userId: event.requestContext.authorizer.userId,
    tier: event.requestContext.authorizer.tier,
  }
}

export const isHighTierUser = (currentUser: CurrentUser): boolean => {
  const { tier } = currentUser
  return [UserTier.Premium, UserTier.Admin].includes(tier)
}
