import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2'
import * as sm from 'aws-cdk-lib/aws-secretsmanager'
import * as apiGatewayIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as dynamoDb from 'aws-cdk-lib/aws-dynamodb'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as deployment from 'aws-cdk-lib/aws-s3-deployment'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

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
      billingMode: dynamoDb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    })
    userDb.addGlobalSecondaryIndex({
      indexName: 'email-index',
      partitionKey: {
        name: 'email',
        type: dynamoDb.AttributeType.STRING,
      },
      projectionType: dynamoDb.ProjectionType.ALL,
      writeCapacity: 1,
      readCapacity: 1,
    })
    userDb.addGlobalSecondaryIndex({
      indexName: 'github-id-index',
      partitionKey: {
        name: 'githubId',
        type: dynamoDb.AttributeType.NUMBER,
      },
      projectionType: dynamoDb.ProjectionType.ALL,
      writeCapacity: 1,
      readCapacity: 1,
    })

    const noteDb = new dynamoDb.Table(this, `${stackName}-notes-table`, {
      tableName: `${stackName}-mystashnotesdb`,
      partitionKey: {
        name: 'id',
        type: dynamoDb.AttributeType.STRING,
      },
      billingMode: dynamoDb.BillingMode.PROVISIONED,
      readCapacity: 3,
      writeCapacity: 3,
    })
    noteDb.addGlobalSecondaryIndex({
      indexName: 'user-id-index',
      partitionKey: {
        name: 'userId',
        type: dynamoDb.AttributeType.STRING,
      },
      projectionType: dynamoDb.ProjectionType.ALL,
      writeCapacity: 2,
      readCapacity: 2,
    })

    const fileDb = new dynamoDb.Table(this, `${stackName}-files-table`, {
      tableName: `${stackName}-mystashfilesdb`,
      partitionKey: {
        name: 'id',
        type: dynamoDb.AttributeType.STRING,
      },
      billingMode: dynamoDb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    })
    fileDb.addGlobalSecondaryIndex({
      indexName: 'note-id-index',
      partitionKey: {
        name: 'noteId',
        type: dynamoDb.AttributeType.STRING,
      },
      projectionType: dynamoDb.ProjectionType.ALL,
      writeCapacity: 1,
      readCapacity: 1,
    })
    fileDb.addGlobalSecondaryIndex({
      indexName: 'user-id-index',
      partitionKey: {
        name: 'userId',
        type: dynamoDb.AttributeType.STRING,
      },
      projectionType: dynamoDb.ProjectionType.ALL,
      writeCapacity: 1,
      readCapacity: 1,
    })

    /* ----------\
    | FILES      |
    \-----------*/
    const filesBucket = new s3.Bucket(this, `${stackName}-files-bucket`, {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
      cors: [
        {
          allowedOrigins: ['*'],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedHeaders: ['*'],
        },
      ],
    })

    // IAM Role and Policy for generating signed URLs
    const signedUrlRole = new iam.Role(this, 'SignedUrlRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    })

    signedUrlRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject', 's3:PutObject'],
        resources: [filesBucket.arnForObjects('*')],
      })
    )

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
      ENVIRONMENT: process.env.ENVIRONMENT ?? 'prod',
      REGION: props.env?.region ?? 'eu-north-1',
      PRIMARY_KEY: 'id',
      NOTES_TABLE_NAME: noteDb.tableName,
      USERS_TABLE_NAME: userDb.tableName,
      FILES_TABLE_NAME: fileDb.tableName,
      FILES_BUCKET_NAME: filesBucket.bucketName,
      S3_ENDPOINT: `https://${filesBucket.bucketRegionalDomainName}`,
      GITHUB_CLIENT_ID: githubClientId,
      GITHUB_CLIENT_SECRET: githubClientSecret,
      GITHUB_REDIRECT_URI: 'https://mystash.70511337.xyz/',
      SECRET: secret
        .secretValueFromJson('mystash-secret')
        .toString()
        .slice(0, 32),
    }

    const registerHandler = new lambdaNodeJs.NodejsFunction(
      this,
      `${stackName}-register-lambda-handler`,
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'handler',
        entry: '../packages/backend/src/handlers/register.ts',
        functionName: `${stackName}-register-lambda`,
        environment,
      }
    )
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
    const getNoteFilesHandler = new lambdaNodeJs.NodejsFunction(
      this,
      `${stackName}-get-note-files-lambda-handler`,
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'handler',
        entry: '../packages/backend/src/handlers/get-note-files.ts',
        functionName: `${stackName}-get-note-files-lambda`,
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
    const uploadFileHandler = new lambdaNodeJs.NodejsFunction(
      this,
      `${stackName}-upload-file-lambda-handler`,
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'handler',
        entry: '../packages/backend/src/handlers/upload-file.ts',
        functionName: `${stackName}-upload-file-lambda`,
        timeout: cdk.Duration.seconds(30),
        environment,
      }
    )
    const deleteFileHandler = new lambdaNodeJs.NodejsFunction(
      this,
      `${stackName}-delete-file-lambda-handler`,
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'handler',
        entry: '../packages/backend/src/handlers/delete-file.ts',
        functionName: `${stackName}-delete-file-lambda`,
        timeout: cdk.Duration.seconds(30),
        environment,
      }
    )

    /*------------------------\
    | LAMBDA DB ACCESS        |
    \------------------------*/
    userDb.grantReadWriteData(registerHandler)
    userDb.grantReadWriteData(loginHandler)
    userDb.grantReadWriteData(githubVerifyHandler)

    noteDb.grantWriteData(createNoteHandler)
    noteDb.grantReadData(getNotesHandler)
    noteDb.grantReadWriteData(updateNoteHandler)
    noteDb.grantReadWriteData(deleteNoteHandler)

    fileDb.grantReadData(getNoteFilesHandler)
    fileDb.grantWriteData(uploadFileHandler)
    fileDb.grantReadWriteData(deleteFileHandler)

    /*------------------------\
    | LAMBDA S3 ACCESS        |
    \------------------------*/

    filesBucket.grantReadWrite(uploadFileHandler)
    filesBucket.grantRead(getNoteFilesHandler)

    /*------------------------\
    | API GATEWAY             |
    \------------------------*/
    const registerIntegration =
      new apiGatewayIntegrations.HttpLambdaIntegration(
        'LambdaIntegration',
        registerHandler
      )
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
    const getNoteFilesIntegration =
      new apiGatewayIntegrations.HttpLambdaIntegration(
        'LambdaIntegration',
        getNoteFilesHandler
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
    const uploadFileIntegration =
      new apiGatewayIntegrations.HttpLambdaIntegration(
        'LambdaIntegration',
        uploadFileHandler
      )
    const deleteFileIntegration =
      new apiGatewayIntegrations.HttpLambdaIntegration(
        'LambdaIntegration',
        deleteFileHandler
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
      path: '/api/register',
      methods: [apigateway.HttpMethod.POST],
      integration: registerIntegration,
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
      path: '/api/note/files/{id}',
      methods: [apigateway.HttpMethod.GET],
      integration: getNoteFilesIntegration,
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
    api.addRoutes({
      path: '/api/file',
      methods: [apigateway.HttpMethod.POST],
      integration: uploadFileIntegration,
    })
    api.addRoutes({
      path: '/api/file/{id}',
      methods: [apigateway.HttpMethod.DELETE],
      integration: deleteFileIntegration,
    })

    /* ----------\
    | FRONTEND   |
    \-----------*/
    // Create an S3 bucket for hosting the React app
    const websiteBucket = new s3.Bucket(this, `${stackName}-website-bucket`, {
      bucketName: `${stackName}-frontend-bucket`,
      versioned: true,
      publicReadAccess: false, // Access is only provided via CloudFront
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    })

    // Create Origin Access Control (OAC) for CloudFront to access S3
    const originAccessControl = new cloudfront.S3OriginAccessControl(this, `${stackName}-OAC`, {
      description: `OAC for ${stackName}`,
    })

    const certArn = ssm.StringParameter.valueForStringParameter(this, 'PROD_MYSTASH_CERTIFICATE_ARN');
    const certificate = acm.Certificate.fromCertificateArn(this, `${stackName}-domain-cert`, certArn);

    // Create a CloudFront distribution using the new Distribution construct
    const distribution = new cloudfront.Distribution(this, `${stackName}-Distribution`, {
      domainNames: ['mystash.70511337.xyz'],
      certificate,
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket, {
          originAccessControl,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(30),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(30),
        },
      ],
    })

    // Grant CloudFront access to the S3 bucket via bucket policy
    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [websiteBucket.arnForObjects('*')],
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          },
        },
      })
    )

    // Deploy the React app to the S3 bucket
    new deployment.BucketDeployment(this, `${stackName}-DeployWebsite`, {
      sources: [deployment.Source.asset('../packages/frontend/dist')],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    })
  }
}
