const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatHistory = new Schema({
  role: {
    type: String,
  },
  content: {
    type: String,
  },
  dataflow: {
    type: Object,
  },
  created_at: {
    type: Date,
  },
});

const AdvancedChat = new Schema({
  name: { type: String },
  chat_log: [ChatHistory],
  prompt_id: {
    type: mongoose.Types.ObjectId,
  },
  prompt_type: {
    type: Number,
  },
  user_id: {
    type: mongoose.Types.ObjectId,
  },
});

module.exports = mongoose.model("advanced_chats", AdvancedChat);
