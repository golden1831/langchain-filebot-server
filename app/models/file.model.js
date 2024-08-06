const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const File = new Schema({
  name: {
    type: String,
  },
  original_name: {
    type: String,
  },
  path: {
    type: String,
  },
  user_id: {
    type: mongoose.Types.ObjectId,
  },
  character_len: {
    type: Number,
  },
  status: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("files", File);
