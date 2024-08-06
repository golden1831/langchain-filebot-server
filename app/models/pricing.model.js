const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Pricing = new Schema({
  stripe_id: {
    type: String,
  },
  name: {
    type: String,
  },
  price: {
    type: Number,
  },
  priority: {
    type: Number,
  },
});

module.exports = mongoose.model("pricings", Pricing);
