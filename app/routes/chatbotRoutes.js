module.exports = (app) => {
  const chatbotController = require("../controllers/chatbotController");

  var router = require("express").Router();

  router.post("/chat", chatbotController.chat);

  router.get("/deactive/:id", chatbotController.deActive);

  app.use("/api/chatbot", router);
};
