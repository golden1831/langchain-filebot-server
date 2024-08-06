const express = require("express");
const router = express.Router();
const userController = require("../../controllers/User.controller");
const { authToken } = require("../../middleware/Auth.middleware");

router.get("/info", [authToken], userController.getOne);

router.put("/update", [authToken], userController.updateOneByUser);

module.exports = router;
