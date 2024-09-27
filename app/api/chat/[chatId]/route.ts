import dotenv from "dotenv";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

import { tool } from "@langchain/core/tools";
import { DynamoDBChatMessageHistory } from "@langchain/community/stores/message/dynamodb";
import { AzureChatOpenAI } from "@langchain/openai";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

// import { } from "ai";
import { updateLastMessagesAdditionalKwargs } from "@/lib/dynamoDB";

// TODO: MAP EACH CHAT TO UNIQUE CHAT HISTORY ID

// import { ChatOpenAI } from "@langchain/openai";
// import { CallbackManager } from "@langchain/core/callbacks/manager";
// import { MemoryManager } from "@/lib/memory";
// import {
//   checkAiRequestsCount,
//   decreaseAiRequestsCount,
// } from "@/lib/user-settings";
// import { checkSubscription } from "@/lib/subscription";
// import { rateLimit } from "@/lib/rate-limit";

dotenv.config({ path: `.env` });

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } },
) {
  try {
    const userId = req.headers.get("userId");

    if (!userId) {
      return Response.json(
        {
          message: "userId not found. please login",
        },
        { status: 401 },
      );
    }

    const user = await prismadb.user.findUnique({ where: { id: userId } });

    if (!user) {
      return Response.json(
        {
          message: "user not found with given userId",
        },
        { status: 404 },
      );
    }

    console.log(`chat started with ${user.email}`);

    const { prompt: message } = await req.json();

    // const identifier = req.url + "-" + user.id;
    // const { success } = { success: true }; //await rateLimit(identifier);

    // if (!success) {
    //   return new NextResponse("Rate limit exceeded", { status: 429 });
    // }

    // const isPro = true; //await checkSubscription({ userId });

    // if (!isPro) {
    //   const checkAiRequestsCountResp = await checkAiRequestsCount();

    //   if (!checkAiRequestsCountResp) {
    //     return new NextResponse("Premium subscription is required", {
    //       status: 402,
    //     });
    //   }
    // }

    const companion = await prismadb.companion.update({
      where: {
        id: params.chatId,
      },
      data: {
        messages: {
          create: {
            content: message,
            role: "user",
            userId: user.id,
          },
        },
      },
    });

    if (!companion) {
      return new NextResponse("Companion not found", { status: 404 });
    }

    const history = await prismadb.history.upsert({
      where: {
        userId: user.id,
        companionId: companion.id,
      },
      update: {},
      create: {
        userId: user.id,
        companionId: companion.id,
      },
    });

    // new ai part begins from here

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        ` You are a friendly and helpful friend and companion. Answer all questions to the best of your ability.

        YOUR NAME: ${companion.name}
        YOUR INSTRUCTIONS: ${companion.instructions}

        ONLY if the user asks you to send them ANY kind of image/picture call the Get-Image-Tool tool,
        WITHOUT asking the user any details about the image/picture. `,
      ],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
    ]);

    const getImageTool = tool(
      async (userSessionId) => {
        return `https://t4.ftcdn.net/jpg/05/50/33/47/360_F_550334715_0d2cdaljV4Xd3x7yVUhRxfmLLEUyMdXr.jpg`;
      },
      {
        name: "Get-Image-Tool",
        description:
          "Use this tool ONLY if the user asks you to send them ANY kind of image/picture",
      },
    );

    const llm = new AzureChatOpenAI({
      model: "gpt-4o-mini",
      //verbose: true,
    }).bindTools([getImageTool]);

    const chain = prompt.pipe(llm);

    const runnableWithChatHistory = new RunnableWithMessageHistory({
      runnable: chain,
      inputMessagesKey: "input",
      historyMessagesKey: "chat_history",
      getMessageHistory: async (sessionId) => {
        return new DynamoDBChatMessageHistory({
          tableName: process.env.AWS_DYNAMO_DB_TABLE_NAME!,
          partitionKey: process.env.AWS_DYNAMO_DB_TABLE_PARTITION_KEY!,
          sessionId,
          config: {
            region: process.env.AWS_REGION,
            credentials: {
              accessKeyId: process.env.AWS_DYNAMO_DB_ACCESS_KEY_ID!,
              secretAccessKey: process.env.AWS_DYNAMO_DB_SECRET_ACCESS_KEY!,
            },
          },
        });
      },
    });

    const res = await runnableWithChatHistory.invoke(
      { input: message },
      { configurable: { sessionId: history.id } },
    );

    if (!res) {
      return Response.json(
        {
          message: "could not generate response",
        },
        { status: 400 },
      );
    }

    //console.log(res2);
    let content;

    if (res.tool_calls?.length === 0) {
      console.log(res.content);
      content = res.content;
    } else if (res.tool_calls?.length !== 0) {
      console.log(await updateLastMessagesAdditionalKwargs(history.id));
      console.log(await getImageTool.invoke(history.id));
      content = await getImageTool.invoke(history.id);
    }

    // const companion_file_name = companion.id! + ".txt";

    // const companionKey = {
    //   companionId: companion.id,
    //   userId: user.id,
    //   modelName: "gpt-3.5-turbo",
    // };
    // const memoryManager = await MemoryManager.getInstance();

    // const records = await memoryManager.readLatestHistory(companionKey);
    // if (records.length === 0) {
    //   await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey);
    // }
    // await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey);

    // // Query Pinecone

    // const recentChatHistory =
    //   await memoryManager.readLatestHistory(companionKey);

    // // Right now the preamble is included in the similarity search, but that
    // // shouldn't be an issue

    // const similarDocs = await memoryManager.vectorSearch(
    //   recentChatHistory,
    //   companion_file_name,
    // );

    // console.log("recentChatHistory", recentChatHistory, similarDocs);

    // let relevantHistory = "";
    // if (!!similarDocs && similarDocs.length !== 0) {
    //   relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
    // }
    // const { handlers } = LangChainStream();

    // const openai = new ChatOpenAI({
    //   openAIApiKey: process.env.OPENAI_API_KEY,
    //   modelName: "gpt-3.5-turbo",
    //   callbackManager: CallbackManager.fromHandlers(handlers),
    // });

    // // Turn verbose on for debugging
    // openai.verbose = true;

    // const resp = await openai
    //   .invoke(
    //     `
    //     ${companion.instructions}

    //     Try to give responses that are straight to the point.
    //     Below are relevant details about ${companion.name}'s past and the conversation you are in.
    //     ${relevantHistory}

    //     ${recentChatHistory}\n${companion.name}:`,
    //   )
    //   .catch(console.log);

    // const content = resp?.content as string;

    // if (!content && content?.length < 1) {
    //   return new NextResponse("content not found", { status: 404 });
    // }

    // var Readable = require("stream").Readable;
    // let s = new Readable();
    // s.push(content);
    // s.push(null);

    // memoryManager.writeToHistory("" + content, companionKey);

    await prismadb.companion.update({
      where: {
        id: params.chatId,
      },
      data: {
        messages: {
          create: {
            content: content,
            role: "system",
            userId: user.id,
          },
        },
      },
    });

    // if (!isPro) {
    //   await decreaseAiRequestsCount();
    // }

    // return new StreamingTextResponse(s);

    return new NextResponse(content);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
