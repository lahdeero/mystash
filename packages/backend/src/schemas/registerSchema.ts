import { JSONSchemaType } from "ajv";
import { RegisterRequest } from "@mystash/shared"

export const registerRequestSchema: JSONSchemaType<RegisterRequest> = {
    type: 'object',
    additionalProperties: false,
    properties: {
        firstName: { type: 'string', minLength: 1 },
        lastName: { type: 'string', minLength: 1 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
    },
    required: ['firstName', 'lastName', 'email', 'password'],
}