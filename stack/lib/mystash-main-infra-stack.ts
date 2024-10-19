import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2'
import * as sm from 'aws-cdk-lib/aws-secretsmanager'
import * as apiGatewayIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as dynamoDb from 'aws-cdk-lib/aws-dynamodb'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as deployment from 'aws-cdk-lib/aws-s3-deployment'
import * as ssm from 'aws-cdk-lib/aws-ssm'

export class MystashInfraStack extends cdk.Stack {
  constructor(app: cdk.App, id: string, props: cdk.StackProps) {
    super(app, id, props)
    const { stackName } = props

    /*-----------------\
    | DYNAMO DB        |
    \-----------------*/
    const userDb = new dynamoDb.Table(this, `${stackName}-users-table`, {
      tableName: `${stackName}-mystashusersdb`,
      partitionKey: {
        name: 'id',
        type: dynamoDb.AttributeType.STRING,
      },
    })
    userDb.addGlobalSecondaryIndex({
      indexName: 'email-index',
      partitionKey: {
        name: 'email',
        type: dynamoDb.AttributeType.STRING,
      },
      projectionType: dynamoDb.ProjectionType.ALL,
    })
    userDb.addGlobalSecondaryIndex({
      indexName: 'github-id-index',
      partitionKey: {
        name: 'githubId',
        type: dynamoDb.AttributeType.NUMBER,
      },
      projectionType: dynamoDb.ProjectionType.ALL,
    })

    const noteDb = new dynamoDb.Table(this, `${stackName}-notes-table`, {
      tableName: `${stackName}-mystashnotesdb`,
      partitionKey: {
        name: 'id',
        type: dynamoDb.AttributeType.STRING,
      },
    })
    noteDb.addGlobalSecondaryIndex({
      indexName: 'user-id-index',
      partitionKey: {
        name: 'userId',
        type: dynamoDb.AttributeType.STRING,
      },
      projectionType: dynamoDb.ProjectionType.ALL,
    })

    /*-----------------\
    | LAMBDA HANDLERS  |
    \-----------------*/
    const secret = sm.Secret.fromSecretAttributes(
      this,
      `${stackName}-ImportedSecret`,
      {
        secretCompleteArn:
          'arn:aws:secretsmanager:eu-north-1:234190327561:secret:Mystash-secret-ckyDa8',
      }
    )
    const githubClientId = ssm.StringParameter.valueForStringParameter(
      this,
      'PROD_MYSTASH_GITHUB_CLIENT_ID'
    )
    const githubClientSecret = ssm.StringParameter.valueForStringParameter(
      this,
      'PROD_MYSTASH_GITHUB_CLIENT_SECRET'
    )
    const environment = {
      REGION: props.env?.region ?? 'eu-north-1',
      PRIMARY_KEY: 'id',
      NOTES_TABLE_NAME: noteDb.tableName,
      USERS_TABLE_NAME: userDb.tableName,
      GITHUB_CLIENT_ID: githubClientId,
      GITHUB_CLIENT_SECRET: githubClientSecret,
      GITHUB_REDIRECT_URI: 'https://mystash.70511337.xyz/',
      SECRET: secret
        .secretValueFromJson('mystash-secret')
        .toString()
        .slice(0, 32),
    }

    const loginHandler = new lambdaNodeJs.NodejsFunction(
      this,
      `${stackName}-login-lambda-handler`,
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'handler',
        entry: '../packages/backend/src/handlers/login.ts',
        functionName: `${stackName}-login-lambda`,
        environment,
      }
    )
    const createNoteHandler = new lambdaNodeJs.NodejsFunction(
      this,
      `${stackName}-create-note-lambda-handler`,
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'handler',
        entry: '../packages/backend/src/handlers/create-note.ts',
        functionName: `${stackName}-create-note-lambda`,
        environment,
      }
    )
    const getNotesHandler = new lambdaNodeJs.NodejsFunction(
      this,
      `${stackName}-get-notes-lambda-handler`,
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'handler',
        entry: '../packages/backend/src/handlers/get-notes.ts',
        functionName: `${stackName}-get-notes-lambda`,
        environment,
      }
    )
    const updateNoteHandler = new lambdaNodeJs.NodejsFunction(
      this,
      `${stackName}-update-note-lambda-handler`,
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'handler',
        entry: '../packages/backend/src/handlers/update-note.ts',
        functionName: `${stackName}-update-note-lambda`,
        environment,
      }
    )
    const deleteNoteHandler = new lambdaNodeJs.NodejsFunction(
      this,
      `${stackName}-delete-note-lambda-handler`,
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'handler',
        entry: '../packages/backend/src/handlers/delete-note.ts',
        functionName: `${stackName}-delete-note-lambda`,
        environment,
      }
    )
    const githubLoginHandler = new lambdaNodeJs.NodejsFunction(
      this,
      `${stackName}-github-login-lambda-handler`,
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'handler',
        entry: '../packages/backend/src/handlers/github-login.ts',
        functionName: `${stackName}-github-login-lambda`,
        environment,
      }
    )
    const githubVerifyHandler = new lambdaNodeJs.NodejsFunction(
      this,
      `${stackName}-github-verify-lambda-handler`,
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'handler',
        entry: '../packages/backend/src/handlers/github-verify.ts',
        functionName: `${stackName}-github-verify-lambda`,
        environment,
      }
    )

    /*------------------------\
    | LAMBDA DB ACCESS        |
    \------------------------*/

    userDb.grantReadWriteData(loginHandler)
    userDb.grantReadWriteData(githubVerifyHandler)

    noteDb.grantWriteData(createNoteHandler)
    noteDb.grantReadData(getNotesHandler)
    noteDb.grantReadWriteData(updateNoteHandler)
    noteDb.grantReadWriteData(deleteNoteHandler)

    /*------------------------\
    | API GATEWAY             |
    \------------------------*/

    const loginIntegration = new apiGatewayIntegrations.HttpLambdaIntegration(
      'LambdaIntegration',
      loginHandler
    )
    const createNoteIntegration =
      new apiGatewayIntegrations.HttpLambdaIntegration(
        'LambdaIntegration',
        createNoteHandler
      )
    const getNotesIntegration =
      new apiGatewayIntegrations.HttpLambdaIntegration(
        'LambdaIntegration',
        getNotesHandler
      )
    const updateNoteIntegration =
      new apiGatewayIntegrations.HttpLambdaIntegration(
        'LambdaIntegration',
        updateNoteHandler
      )
    const deleteNoteIntegration =
      new apiGatewayIntegrations.HttpLambdaIntegration(
        'LambdaIntegration',
        deleteNoteHandler
      )
    const githubLoginIntegration =
      new apiGatewayIntegrations.HttpLambdaIntegration(
        'LambdaIntegration',
        githubLoginHandler
      )
    const githubVerifyIntegration =
      new apiGatewayIntegrations.HttpLambdaIntegration(
        'LambdaIntegration',
        githubVerifyHandler
      )

    const api = new apigateway.HttpApi(this, `${stackName}-api-gateway`, {
      description: 'Mystash API gateway',
      corsPreflight: {
        allowOrigins: ['*'], // Specify allowed origins or set to '*' for any origin
        allowMethods: [
          apigateway.CorsHttpMethod.GET,
          apigateway.CorsHttpMethod.POST,
          apigateway.CorsHttpMethod.PUT,
          apigateway.CorsHttpMethod.DELETE,
        ],
        allowHeaders: ['*'],
      },
    })

    api.addRoutes({
      path: '/api/login',
      methods: [apigateway.HttpMethod.POST],
      integration: loginIntegration,
    })
    api.addRoutes({
      path: '/api/note',
      methods: [apigateway.HttpMethod.POST],
      integration: createNoteIntegration,
    })
    api.addRoutes({
      path: '/api/note',
      methods: [apigateway.HttpMethod.GET],
      integration: getNotesIntegration,
    })
    api.addRoutes({
      path: '/api/note/{id}',
      methods: [apigateway.HttpMethod.PUT],
      integration: updateNoteIntegration,
    })
    api.addRoutes({
      path: '/api/note/{id}',
      methods: [apigateway.HttpMethod.DELETE],
      integration: deleteNoteIntegration,
    })
    api.addRoutes({
      path: '/api/login/github/init',
      methods: [apigateway.HttpMethod.GET],
      integration: githubLoginIntegration,
    })
    api.addRoutes({
      path: '/api/login/github/verify',
      methods: [apigateway.HttpMethod.POST],
      integration: githubVerifyIntegration,
    })

    /* ----------\
    | FRONTEND   |
    \-----------*/

    // Create an S3 bucket for hosting the React app
    const websiteBucket = new s3.Bucket(this, `${stackName}-website-bucket`, {
      bucketName: `${stackName}-frontend-bucket`,
      versioned: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: false, // Access is only provided via CloudFront
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // Create an Origin Access Identity for CloudFront to access the S3 bucket
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      `${stackName}-OAI`
    )

    // Grant CloudFront access to the S3 bucket
    websiteBucket.grantRead(originAccessIdentity)

    // Create a CloudFront distribution to serve the React app
    // CloudFrontWebDistribution is deprecated but when using Distribution cannot access to s3 bucket
    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      `${stackName}-WebDistribution`,
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: websiteBucket,
              originAccessIdentity,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      }
    )

    // Deploy the React app to the S3 bucket
    new deployment.BucketDeployment(this, `${stackName}-DeployWebsite`, {
      sources: [deployment.Source.asset('../packages/frontend/build')],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    })
  }
}
