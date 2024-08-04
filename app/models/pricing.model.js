const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Pricing = new Schema ({
    stripe_id: {
        type: String
    },
    name: {
        type: String
    },
    description: {
        type: String
    },
    pay_type: {
        type: String
    },
    price: {
        type: Number
    },
    currency_type: {
        type:  String
    },
	chatbot_count: {
        type: Number
    },
    message_count: {
        type: Number
    },
    pdf_count: {
        type: Number
    },
    character_count: {
        type: Number
    },
    isDeleted: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Pricing', Pricing)
  