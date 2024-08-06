const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Prompt = new Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  content: {
    type: String,
  },
  // prompt_category_id: {
  //   type: mongoose.Types.ObjectId,
  // },
  created_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
  },
  status: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("prompts", Prompt);
