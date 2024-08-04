const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const File = new Schema ({
	name: {
        type: String
	},
	original_name: {
		type: String
	},
	path: {
		type: String
	},
	chatbot_id: {
		type: mongoose.Types.ObjectId
	},
	character_len: {
		type: Number
	}
});

module.exports = mongoose.model('File', File)