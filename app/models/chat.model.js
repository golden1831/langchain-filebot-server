const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatHistory = new Schema ({
	isBot: {
        type: Boolean
    },
    context: {
        type: String
    },
    chatbot_id: {
        type: mongoose.Types.ObjectId
    },
    created_at: {
        type: Date
    }
});

const Chat = new Schema({
    chat_log: {
        type: Array,
        default: []
    },
    chatbot_id: {
        type:mongoose.Types.ObjectId
    }
});

module.exports = mongoose.model('Chat', Chat)