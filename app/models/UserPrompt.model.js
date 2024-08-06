const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Setting = new Schema({
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
  status: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
  },
  user_id: {
    type: mongoose.Types.ObjectId,
  },
});

module.exports = mongoose.model("settings", Setting);
