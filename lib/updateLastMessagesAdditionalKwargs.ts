import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

import dotenv from "dotenv";
dotenv.config();

const tableName = process.env.AWS_DYNAMO_DB_TABLE_NAME!;
const region = process.env.AWS_REGION!;
const accessKeyId = process.env.AWS_DYNAMO_DB_ACCESS_KEY_ID!;
const secretAccessKey = process.env.AWS_DYNAMO_DB_SECRET_ACCESS_KEY!;

export async function updateLastMessagesAdditionalKwargs(
  userSessionId: string,
) {
  const client = new DynamoDBClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const getParams = {
    TableName: tableName,
    Key: {
      id: { S: userSessionId },
    },
  };

  try {
    const getData = await client.send(new GetItemCommand(getParams));
    const messages = getData.Item.messages.L;
    const messagesLength = messages.length;

    if (messagesLength === 0) {
      return "no messages found";
    }

    const updateParams = {
      TableName: tableName,
      Key: {
        id: { S: userSessionId },
      },
      UpdateExpression: `SET #messages[${messagesLength - 1}].#ak = :emptyObj`,
      ExpressionAttributeNames: {
        "#messages": "messages",
        "#ak": "additional_kwargs",
      },
      ExpressionAttributeValues: {
        ":emptyObj": { S: "{}" },
      },
      ReturnValues: "UPDATED_NEW",
    };

    const updateData = await client.send(new UpdateItemCommand(updateParams));
    return updateData;
  } catch (err) {
    return err;
  }
}
