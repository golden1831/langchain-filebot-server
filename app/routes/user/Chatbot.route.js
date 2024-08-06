const express = require("express");
const router = express.Router();
const chatbotController = require("../../controllers/Chatbot.controller");
const advancedChatController = require("../../controllers/AdvancedChat.controller");

router.get("/chat", chatbotController.onChat);
router.get("/advanced_chat", advancedChatController.onChat);
router.get("/advanced_dataflow", advancedChatController.onDataflow);

module.exports = router;
