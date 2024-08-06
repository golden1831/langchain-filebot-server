const AdvancedChat = require("../models/AdvancedChat.model");
const Pricing = require("../models/Pricing.model");
const User = require("../models/User.model");
const Prompt = require("../models/Prompt.model");
const UserPrompt = require("../models/UserPrompt.model");
const env = require("dotenv").config();
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const { PineconeStore } = require("@langchain/pinecone");
const { Pinecone } = require("@pinecone-database/pinecone");
const {
  createStuffDocumentsChain,
} = require("langchain/chains/combine_documents");
const {
  ChatPromptTemplate,
  MessagesPlaceholder,
} = require("@langchain/core/prompts");
const { BaseMessage } = require("@langchain/core/messages");
const {
  RunnableMap,
  RunnablePassthrough,
  RunnableSequence,
} = require("@langchain/core/runnables");
const { HumanMessage, AIMessage } = require("@langchain/core/messages");
const { RunnableBranch } = require("@langchain/core/runnables");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatAnthropic } = require("@langchain/anthropic");
const { ChatMessageHistory } = require("langchain/stores/message/in_memory");
const { StructuredTool } = require("@langchain/core/tools");
const { Document } = require("@langchain/core/documents");
const { JsonOutputKeyToolsParser } = require("langchain/output_parsers");
const { z } = require("zod");
const { formatToOpenAITool } = require("@langchain/openai");

const mongoose = require("mongoose");
const { isEmpty } = require("lodash");
const { ServerErrorMsg, SuccessMsg } = require("../constants/StatusMessage");
const { ServerError, Success } = require("../constants/StatusCode");
require("dotenv").config();

const writeEvent = (res, sseId, event, data) => {
  res.write(`id: ${sseId}\n`);
  res.write(`event: ${event}\n`);
  res.write(`data: ${data}\n\n`);
};

const formatDocsWithId = (docs) => {
  return (
    "\n\n" + docs.map((doc, idx) => `Data: ${doc.pageContent}`).join("\n\n")
  );
};

const nodeSchema = z.object({
  id: z
    .string()
    .describe("Unique identifier representing a specific entity or concept."),
});

const linkSchema = z.object({
  source: z
    .string()
    .describe(
      "Identifier of the source node, indicating the starting point of a relationship."
    ),
  target: z
    .string()
    .describe(
      "Identifier of the target node, indicating the endpoint of a relationship."
    ),
  type: z
    .string()
    .describe(
      "Describes the nature of the relationship or link between the source and target nodes."
    ),
});

class QuotedAnswer extends StructuredTool {
  name = "quoted_answer";

  description =
    "A comprehensive model that visualizes the interactions and relationships among various entities in the field of cybersecurity.";

  schema = z.object({
    nodes: z
      .array(nodeSchema)
      .describe(
        "An array of nodes, each representing an entity or concept in cybersecurity."
      ),
    links: z
      .array(linkSchema)
      .describe(
        "An array of links, each defining a specific relationship or interaction between two nodes."
      ),
  });
}
const onChat = async (req, res) => {
  const sseId = new Date().toLocaleTimeString();
  try {
    const { user_id, chat_id, message, model } = req.query;

    const user = await User.findById(user_id);
    // if (!user) sendErrorMessage(res, sseId, "No User!");
    const origin = req.get("origin");

    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // let userInfo = setting[0]?.users;
    // let pricingInfo = setting[0]?.pricings;
    // let freePricing = await Pricing.findOne({ name: "Free" });

    // if (
    //   new Date().valueOf() > new Date(userInfo.end).valueOf() ||
    //   new Date(userInfo.start) === new Date(userInfo.end)
    // ) {
    //   if (userInfo.pricing_id !== freePricing._id) {
    //     await User.findByIdAndUpdate(userInfo._id, {
    //       $set: { pricing_id: freePricing._id },
    //     });
    //     pricingInfo = freePricing;
    //   }
    // }
    let chatFlag = true;

    const chatListByUser = await AdvancedChat.find({ user_id: user_id });
    let tokenCount = 0;
    chatListByUser?.map((item) => {
      item.chat_log?.map((info) => {
        tokenCount += info.content?.length;
      });
    });

    if (
      user.pricing_priority > 1 ||
      (user.pricing_priority === 1 &&
        message.length < 20000 &&
        tokenCount < 20000)
    ) {
      chatFlag = true;
    } else {
      console.log("error");
      // sendErrorMessage(
      //   res,
      //   sseId,
      //   "You have run out of tokens. Subscription required to maintain access."
      // );
    }

    // Process chat history
    const chatHistoryData = [];
    const chatData = await AdvancedChat.findById(chat_id);
    if (!isEmpty(chatData)) {
      const chatLog = chatData?.chat_log;
      let lastChatData = [];
      if (chatLog?.length > 10) lastChatData = chatLog.slice(-10);
      else lastChatData = chatLog;

      if (model.includes("gpt") || model.includes("claude")) {
        await Promise.all(
          lastChatData?.map(async (item) => {
            if (!item.isBot)
              chatHistoryData.push(new HumanMessage(item.content));
            else chatHistoryData.push(new AIMessage(item.content));
          })
        );
      }
      chatHistoryData.push(new HumanMessage(message));
    }

    // Get system prompt
    let prompt = "";
    if (!isEmpty(chatData) && chatData?.prompt_type === 1) {
      const userPromptData = await Prompt.findById(chatData?.prompt_id);
      prompt = userPromptData?.content;
    } else {
      const promptData = await UserPrompt.findById(chatData?.prompt_id);
      prompt = promptData?.content;
    }

    // let start = new Date(userInfo.start);
    // let end = new Date(userInfo.end);
    // if (new Date().valueOf() > new Date(end).valueOf() || start === end) {
    //   let condDate = new Date(userInfo.start).getDate();

    //   start = new Date().setDate(condDate);
    //   end = new Date().setDate(condDate);

    //   let todayMonth = new Date().getMonth();
    //   let todayDate = new Date().getDate();
    //   if (todayDate <= condDate) {
    //     start = new Date(start).setMonth(todayMonth - 1);
    //   } else {
    //     end = new Date(end).setMonth(todayMonth + 1);
    //   }
    // }

    // let count = chatLog.chat_log?.filter(
    //   (item) =>
    //     item.isBot === true &&
    //     new Date(item.created_at) >= new Date(userInfo.start) &&
    //     new Date(item.created_at) <= new Date(userInfo.end)
    // ).length;

    // if (isEmpty(chatLog.chat_log)) chatFlag = true;

    if (chatFlag) {
      const userMsg = {
        role: "user",
        content: message,
        created_at: new Date(),
      };
      await AdvancedChat.findByIdAndUpdate(
        chat_id,
        {
          $push: {
            chat_log: userMsg,
          },
        },
        { new: true }
      );

      const botMsg = {
        role: "assistant",
        content: "",
        created_at: new Date(),
      };
      const aiMessage = await AdvancedChat.findByIdAndUpdate(
        chat_id,
        {
          $push: {
            chat_log: botMsg,
          },
        },
        { new: true }
      );
      let lastAIResponse = {};
      if (aiMessage && aiMessage.chat_log && aiMessage.chat_log.length > 0) {
        let lastAIResponse = aiMessage.chat_log[aiMessage.chat_log.length - 1];
        writeEvent(res, sseId, "chat_history_id", lastAIResponse?._id);
      }

      let chatModel;
      if (model.includes("gpt"))
        chatModel = new ChatOpenAI({
          model: model,
          temperature: 0.2,
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

      if (model.includes("claude"))
        chatModel = new ChatAnthropic({
          anthropicApiKey: process.env.ANTHROPIC_API_KEY,
          modelName: model,
        });

      if (model.includes("gemini"))
        chatModel = new ChatGoogleGenerativeAI({
          model: model,
          maxOutputTokens: 2048,
          streaming: true,
          apiKey: process.env.GOOGLE_API_KEY,
        });

      const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
      const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
      const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
        { pineconeIndex, namespace: process.env.PINECONE_NAMESPACE }
      );
      const retriever = vectorStore.asRetriever();

      const SYSTEM_TEMPLATE = `${prompt}
        Answer the user's questions based on the below context.
        You're friendly and you answer extensively. You prefer to use bullet-points to summarize.
        If you don't know the answer, don't say that you don't know, try to make up an answer abundantly:

          <context>
          {context}
          </context>
        `;

      const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
        ["system", SYSTEM_TEMPLATE],
        new MessagesPlaceholder("messages"),
      ]);

      const documentChain = await createStuffDocumentsChain({
        llm: chatModel,
        prompt: questionAnsweringPrompt,
      });

      const queryTransformPrompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          "You are friendly AI assistant. You're friendly and you answer extensively!",
        ],
        new MessagesPlaceholder("messages"),
      ]);

      const parseRetrieverInput = (params) => {
        return params.messages[params.messages.length - 1].content;
      };

      const queryTransformingRetrieverChain = RunnableBranch.from([
        [
          (params) => params.messages.length === 1,
          RunnableSequence.from([parseRetrieverInput, retriever]),
        ],
        queryTransformPrompt
          .pipe(chatModel)
          .pipe(new StringOutputParser())
          .pipe(retriever),
      ]).withConfig({ runName: "chat_retriever_chain" });

      const conversationalRetrievalChain = RunnablePassthrough.assign({
        context: queryTransformingRetrieverChain,
      }).assign({
        answer: documentChain,
      });

      const stream = await conversationalRetrievalChain.stream({
        messages: [new HumanMessage(message)],
      });

      let allContent = "";
      for await (const chunk of stream) {
        for (const key of Object.keys(chunk)) {
          if (key === "answer") {
            allContent += chunk[key];
            writeEvent(res, sseId, "message", chunk[key]);
          }
        }
      }

      const ddd = await AdvancedChat.findByIdAndUpdate(
        chat_id,
        { $set: { "chat_log.$[elem].content": allContent } }, // Update operation
        {
          arrayFilters: [
            {
              "elem._id": new mongoose.Types.ObjectId(
                aiMessage.chat_log[aiMessage.chat_log.length - 1]._id
              ),
            },
          ], // Array filter to identify the specific element
          new: true,
        }
      );
      // console.log(ddd);

      // const botMsg = {
      //   role: "assistant",
      //   content: allContent,
      //   created_at: new Date(),
      // };
      // await AdvancedChat.findByIdAndUpdate(
      //   chat_id,
      //   {
      //     $push: {
      //       chat_log: botMsg,
      //     },
      //   },
      //   { new: true }
      // );
      res.end();
    } else {
      writeEvent(res, sseId, "error", "Lack of token.");
    }
  } catch (err) {
    console.log(err.message);
    writeEvent(res, sseId, "error", err.message);
  }
};

const onDataflow = async (req, res) => {
  try {
    const { chat_id, id, message } = req.query;
    console.log(req.query);

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You're a helpful cybersecurity advisor. Given a user question and some security complinance data, answer the user question. \n\n Here are the security complinance data:{context}",
      ],
      ["human", "{question}"],
    ]);

    const llm = new ChatOpenAI({
      model: "gpt-4-turbo-preview",
      // temperature: 0.2,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      { pineconeIndex, namespace: process.env.PINECONE_NAMESPACE }
    );
    const retriever = vectorStore.asRetriever();

    const quotedAnswerTool = formatToOpenAITool(new QuotedAnswer());
    const tools2 = [quotedAnswerTool];
    const outputParser2 = new JsonOutputKeyToolsParser({
      keyName: "quoted_answer",
      returnSingle: true,
    });
    const llmWithTool2 = llm.bind({
      tools: tools2,
      tool_choice: quotedAnswerTool,
    });
    const answerChain2 = prompt.pipe(llmWithTool2).pipe(outputParser2);
    const map2 = RunnableMap.from({
      question: new RunnablePassthrough(),
      docs: retriever,
    });

    const chain2 = map2
      .assign({
        context: (input) => formatDocsWithId(input.docs),
      })
      .assign({ quoted_answer: answerChain2 })
      .pick(["quoted_answer", "docs"]);

    const result = await chain2.invoke(message);
    console.log(result);

    let dataflowJson = {};
    for (const key of Object.keys(result)) {
      if (key === "quoted_answer") {
        dataflowJson = result[key];
      }
    }
    await AdvancedChat.findByIdAndUpdate(
      chat_id,
      { $set: { "chat_log.$[elem].dataflow": dataflowJson } }, // Update operation
      {
        arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(id) }], // Array filter to identify the specific element
        new: true,
      }
    );
    console.log(dataflowJson);

    return res
      .status(Success)
      .json({ data: dataflowJson, message: SuccessMsg });
  } catch (err) {
    return res.status(ServerError).json({ message: err.message });
  }
};

module.exports = {
  onChat,
  onDataflow,
};
