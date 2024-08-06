const express = require("express");
const router = express.Router();
const sourceController = require("../../controllers/Source.controller");
const { authToken } = require("../../middleware/Auth.middleware");

router.get("/embed", [authToken], sourceController.embedSource);

router.get("/list", [authToken], sourceController.getSource);

module.exports = router;
