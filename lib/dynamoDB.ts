import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";

import dotenv from "dotenv";
dotenv.config();

const region = process.env.AWS_REGION!;
const tableName = process.env.AWS_DYNAMO_DB_TABLE_NAME!;
const partitionKey = process.env.AWS_DYNAMO_DB_TABLE_PARTITION_KEY!;
const accessKeyId = process.env.AWS_DYNAMO_DB_ACCESS_KEY_ID!;
const secretAccessKey = process.env.AWS_DYNAMO_DB_SECRET_ACCESS_KEY!;

const client = new DynamoDBClient({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function updateLastMessagesAdditionalKwargs(
  userCompanionChatHistorySessionId: string,
) {
  const getParams = {
    TableName: tableName,
    Key: {
      [partitionKey]: { S: userCompanionChatHistorySessionId },
    },
  };

  try {
    const getData = await client.send(new GetItemCommand(getParams));
    const messages = getData.Item?.messages.L!;
    const messagesLength = messages?.length;

    if (messagesLength === 0) {
      return "no messages found";
    }

    const updateParams: any = {
      TableName: tableName,
      Key: {
        [partitionKey]: { S: userCompanionChatHistorySessionId },
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
  } catch (error) {
    return error;
  }
}

export async function deleteUserCompanionChatHistory(
  userCompanionChatHistorySessionId: string,
) {
  const deleteParams = {
    TableName: tableName,
    Key: {
      [partitionKey]: { S: userCompanionChatHistorySessionId },
    },
  };

  try {
    const deleteData = await client.send(new DeleteItemCommand(deleteParams));
    return deleteData;
  } catch (error) {
    return error;
  }
}
