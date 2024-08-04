const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatbotFile = new Schema ({
	name: {
        type: String
    },
    settingId: {
        type: String
    },
    isDeleted: {
        type: Boolean
    }
});

module.exports = mongoose.model('ChatbotFile', ChatbotFile)
  