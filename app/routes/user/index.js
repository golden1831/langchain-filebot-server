const express = require("express");
const router = express.Router();
const authRouter = require("./Auth.route");
const pricingRouter = require("./Pricing.route");
const chatbotRouter = require("./Chatbot.route");
const fileRouter = require("./File.route");
const userPromptRouter = require("./UserPrompt.route");
const userRouter = require("./User.route");
const sourceRouter = require("./Source.route");
const chatHistoryRouter = require("./ChatHistory.route");
const prmptCategoryRouter = require("./PromptCategory.route");
const promptRouter = require("./Prompt.route");

router.use("/auth", authRouter);
router.use("/pricing", pricingRouter);
router.use("/profile", userRouter);
router.use("/chatbot", chatbotRouter);
router.use("/embed_file", fileRouter);
router.use("/user_prompt", userPromptRouter);
router.use("/source", sourceRouter);
router.use("/chat_history", chatHistoryRouter);
router.use("/prompt_category", prmptCategoryRouter);
router.use("/prompt", promptRouter);

module.exports = router;
