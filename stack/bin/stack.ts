import * as cdk from "aws-cdk-lib";
import { MystashInfraStack } from "../lib/mystash-main-infra-stack";

const app = new cdk.App();
const env = "prod"; // TODO: Make as environment variable
const appName = 'mystash'

new MystashInfraStack(app, `${env}MystashInfraStack`, {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
  stackName: `${appName}-${env}-infra`,
});
