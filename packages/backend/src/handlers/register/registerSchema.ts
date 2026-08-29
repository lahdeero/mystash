import { JSONSchemaType } from "ajv";
import { MAX_EMAIL_LENGTH, MAX_NICKNAME_LENGTH, MAX_PASSWORD_LENGTH, MIN_NICKNAME_LENGTH, MIN_PASSWORD_LENGTH, RegisterRequest } from "@mystash/shared"

export const registerRequestSchema: JSONSchemaType<RegisterRequest> = {
    type: 'object',
    additionalProperties: false,
    properties: {
        nickname: { type: 'string', minLength: MIN_NICKNAME_LENGTH, maxLength: MAX_NICKNAME_LENGTH },
        email: { type: 'string', format: 'email', maxLength: MAX_EMAIL_LENGTH },
        password: { type: 'string', minLength: MIN_PASSWORD_LENGTH, maxLength: MAX_PASSWORD_LENGTH },
    },
    required: ['nickname', 'email', 'password'],
}