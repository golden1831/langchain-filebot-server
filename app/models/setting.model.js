const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Setting = new Schema({
  botName: {
    type: String,
    default: "Filebot",
  },
  language: {
    type: String,
    default: "english",
  },
  sysPrompt: {
    type: String,
    default: `You are an AI assistant providing helpful answers based on the context to provide conversational answer without any prior knowledge. You are given the following extracted parts of a long document and a question. If you can't find the answer in the context below, just say "Thank you for your question. I can not help you on this topic. Please look online using a search engine.". You can also ask the user to rephrase the question if you need more context. But don't try to make up an answer. If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context. Answer in a concise or elaborate format as per the intent of the question. Use formating ** to bold, __ to italic & ~~ to cut wherever required. Format the answer using headings, paragraphs or points wherever applicable.`,
  },
  headTitle: {
    type: String,
    default: "Heading",
  },
  subHeadTitle: {
    type: String,
    default: "Sub-heading",
  },
  headBackColor: {
    type: String,
    default: "#000000",
  },
  firstMsg: {
    type: String,
    default: "Hello! What can I do for you today?",
  },
  fieldMsg: {
    type: String,
    default: "What is filebot?",
  },
  botMsgColor: {
    type: String,
    default: "#ffffff",
  },
  botMsgBackColor: {
    type: String,
    default: "#c0c0c0",
  },
  userMsgColor: {
    type: String,
    default: "#ffffff",
  },
  userMsgBackColor: {
    type: String,
    default: "#7070f0",
  },
  widgetColor: {
    type: String,
    default: "#2c2c5e",
  },
  chabotType: {
    type: Number,
    default: 0,
  },
  userId: {
    type: mongoose.Types.ObjectId,
  },
  is_public: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Setting", Setting);
