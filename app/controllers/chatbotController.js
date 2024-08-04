const Chat = require("../models/chat.model");
const User = require("../models/user.model");
const Setting = require("../models/setting.model");
const { PineconeClient } = require("@pinecone-database/pinecone");
const { OpenAI } = require("langchain/llms/openai");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const env = require("dotenv").config();
const {
  PromptTemplate,
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} = require("langchain/prompts");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { PineconeStore } = require("langchain/vectorstores/pinecone");
const {
  ConversationalRetrievalQAChain,
  LLMChain,
  loadQAChain,
  StuffDocumentsChain,
  ChatVectorDBQAChain,
} = require("langchain/chains");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.chat = async (req, res) => {
  const { body } = req;

  let token = req.headers["x-auth-token"];
  const decode = jwt.decode(token);

  const userinfo = await User.findById(decode.id);

  let chatFlag = false;

  const chatLog = await Chat.findOne({
    chatbot_id: new mongoose.Types.ObjectId(body.chatbot_id),
  });

  const setting = await Setting.findById(
    new mongoose.Types.ObjectId(body.chatbot_id)
  );

  if (
    new Date(userinfo.start).getFullYear() ===
      new Date(userinfo.end).getFullYear() &&
    new Date(userinfo.start).getMonth() === new Date(userinfo.end).getMonth() &&
    new Date(userinfo.start).getDay() === new Date(userinfo.end).getDay()
  ) {
    let count = chatLog?.chat_log.filter((item) => item.isBot === false).length;
    if (count < decode.msg) chatFlag = true;
  }

  if (
    new Date(userinfo.start).getFullYear() ===
      new Date(userinfo.end).getFullYear() &&
    new Date(userinfo.start).getMonth() !== new Date(userinfo.end).getMonth()
  ) {
    let count = chatLog?.chat_log.filter(
      (item) =>
        item.isBot === false &&
        new Date(item.created_at) >= new Date(decode.start) &&
        new Date(item.created_at) <= new Date(decode.end)
    ).length;
    if (count < decode.msg) chatFlag = true;
  }

  if (chatFlag) {
    try {
      const userMsg = {
        isBot: false,
        context: body.message,
        created_at: new Date(),
        is_active: true,
      };
      await Chat.findOneAndUpdate(
        { chatbot_id: body.chatbot_id },
        {
          $push: {
            chat_log: userMsg,
          },
        }
      );

      const client = new PineconeClient();
      await client.init({
        apiKey: env.parsed.PINECONE_API_KEY,
        environment: env.parsed.PINECONE_ENVIRONMENT,
      });
      const pineconeIndex = client.Index(env.parsed.PINECONE_INDEX);

      const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({ openAIApiKey: env.parsed.OPENAI_API_KEY }),
        { pineconeIndex, namespace: `${body.chatbot_id}` }
      );

      // const llm = new OpenAI({
      //   openAIApiKey: process.env.OPENAI_API_KEY,
      //   temperature: 0,
      // });

      // const llmPrompt = PromptTemplate.fromTemplate(`
      // You are an AI assistant provide an answer to this question in context: {question}, When can't provide answer just say "Thank you for your question. I can not help you on this topic. Please look online using a search engine."
      // `);
      // const template = "";

      // const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      //   SystemMessagePromptTemplate.fromTemplate(
      //     `
      //   You are an AI assistant providing helpful advice. If you can't provide an answer to this question: {question}, only answer: "Thank you for your question. I can not help you on this topic. Please look online using a search engine."
      //   `
      //   ),
      //   HumanMessagePromptTemplate.fromTemplate(`{question}`),
      // ]);

      const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

        Chat History:
        {chat_history}
        Follow Up Input: {question}
        Standalone question:`;

      const QA_PROMPT = `${setting.sysPrompt} ${
        setting.language !== "English"
          ? `Please translate answer into ${setting.language}.`
          : ""
      } 
        =========
        {context}
        =========
        Question: {question}
        Answer:`;
      const chat = new ChatOpenAI({
        temperature: 0,
        openAIApiKey: env.parsed.OPENAI_API_KEY,
      });
      // const results = await vectorStore.similaritySearch(body.message, 1);
      // // const chain = loadQAChain(llm, {type: "stuff", prompt: promptA})
      // const chat_chain = loadQAChain(llm, {prompt: llmPrompt, type: "stuff"})
      // console.log(results);
      // const result = await chat_chain.call({input_documents: results.map(item => item.pageContent), question: body.message})
      // const result_response = new ChatVectorDBQAChain({
      //   vectorstore: vectorStore,
      //   combineDocumentsChain: chat_chain,
      //   questionGeneratorChain: questionGenerator,
      // });
      // console.log(result);
      // console.log('dddd', await result_response.call());
      // const result = await chat_chain.call({input_documents: results.map(item => item.pageContent), question: body.message});

      const chain = ConversationalRetrievalQAChain.fromLLM(
        chat,
        vectorStore.asRetriever(),
        {
          qaTemplate: QA_PROMPT,
          questionGeneratorTemplate: CONDENSE_PROMPT,
          returnSourceDocuments: true,
        }
      );
      const result = await chain.call({
        question: body.message,
        chat_history: [],
      });

      const botMsg = {
        isBot: true,
        context: result.text,
        created_at: new Date(),
        is_active: true,
      };
      await Chat.findOneAndUpdate(
        { chatbot_id: body.chatbot_id },
        {
          $push: {
            chat_log: botMsg,
          },
        }
      );
      if (result) {
        res.send(result);
      }
    } catch (error) {
      console.log(error);
    }

    // const chat = new ChatOpenAI({ temperature: 0 });
    // const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    //   SystemMessagePromptTemplate.fromTemplate(
    //     "You are a helpful assistant that translates {input_language} to {output_language}."
    //   ),
    //   HumanMessagePromptTemplate.fromTemplate("{text}"),
    // ]);
    // const chainB = new LLMChain({
    //   prompt: chatPrompt,
    //   llm: chat,
    // });
    // const resB = await chainB.call({
    //   input_language: "English",
    //   output_language: "French",
    //   text: "I love programming.",
    // });
  } else {
    return res.send({ text: "Sorry lack of message" });
  }
};

exports.deActive = async (req, res) => {
  // const chatLog = await Chat.findOne({
  //   chatbot_id: new mongoose.Types.ObjectId(req.params.id),
  // });
  await Chat.findOneAndUpdate(
    { chatbot_id: new mongoose.Types.ObjectId(req.params.id) },
    {
      $set: {
        "chat_log.is_active": false,
      },
    }
  );
};
