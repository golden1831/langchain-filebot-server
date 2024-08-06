const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  password_hash: {
    type: String,
  },
  pricing_id: {
    type: mongoose.Types.ObjectId,
  },
  pricing_priority: {
    type: Number,
    default: 1,
  },
  start: {
    type: Date,
  },
  end: {
    type: Date,
  },
  isGmail: {
    type: Number,
    default: 0,
  },
  isAdmin: {
    type: Number,
    default: 0,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("users", User);
