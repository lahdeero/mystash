import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT,
  region: 'us-east-1',
})

async function test() {
  try {
    const data = await client.send(new ListTablesCommand({}))
    console.log('Tables:', data.TableNames)
  } catch (e) {
    console.error('Error:', e)
  }
}

test()
