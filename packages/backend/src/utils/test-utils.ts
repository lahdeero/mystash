import { APIGatewayProxyEvent } from 'aws-lambda'

const testToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjllNTNjYTg4LTQ0ZjMtNDIxMC1hNWY3LTkwZDQ3MTdhM2Q2YSIsImZpcnN0TmFtZSI6IkVlcm8iLCJsYXN0TmFtZSI6Ikhlcm1hbm5pIiwiZW1haWwiOiJqZWFocmFpdEBwcm90b25tYWlsLmNvbSIsImlhdCI6MTcyOTM1MzU2MywiZXhwIjoyMDQzODQ5NTYzfQ.S1NiSjdBNTFHRkFYMGdkVk0zSEdVSThLUzE1RjVSTER0NHpxOFZlUmpOVT0'

export const getEvent = (
  body = null,
  httpMethod = 'GET'
): APIGatewayProxyEvent => ({
  body,
  headers: {
    authorization: `Bearer ${testToken}`,
  },
  multiValueHeaders: {},
  httpMethod,
  isBase64Encoded: false,
  path: '',
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {
    accountId: '',
    apiId: '',
    authorizer: {
      userId: '123',
    },
    httpMethod: '',
    identity: {
      accessKey: null,
      accountId: null,
      apiKey: null,
      apiKeyId: null,
      caller: null,
      clientCert: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,
      principalOrgId: null,
      sourceIp: '',
      user: null,
      userAgent: null,
      userArn: null,
    },
    path: '',
    protocol: '',
    requestId: '',
    requestTimeEpoch: 0,
    resourceId: '',
    resourcePath: '',
    stage: '',
  },
  resource: '',
})

export const getContext = () => ({
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'testFunction',
  functionVersion: '1',
  invokedFunctionArn:
    'arn:aws:lambda:us-west-2:123456789012:function:testFunction',
  memoryLimitInMB: '128',
  awsRequestId: 'testRequestId',
  logGroupName: '/aws/lambda/testFunction',
  logStreamName: 'testLogStream',
  getRemainingTimeInMillis: () => 1000,
  done: () => undefined,
  fail: () => undefined,
  succeed: () => undefined,
})
