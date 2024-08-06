const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PromptCategory = new Schema({
  name: {
    type: String,
  },
  status: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("prompt_categories", PromptCategory);
