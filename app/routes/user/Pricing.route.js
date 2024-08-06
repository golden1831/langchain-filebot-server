const express = require("express");
const router = express.Router();
const {
  getAll,
  subscription,
  webhooks,
} = require("../../controllers/Pricing.controller");
const { authToken } = require("../../middleware/Auth.middleware");

router.get("/list", getAll);

router.post("/subscription", subscription);

router.post("/webhook", webhooks);

module.exports = router;
