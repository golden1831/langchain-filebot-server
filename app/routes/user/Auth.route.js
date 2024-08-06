const express = require("express");
const router = express.Router();
const authController = require("../../controllers/Auth.controller");

router.post("/register", authController.userRegister);

router.post("/login", authController.userLogin);

router.post("/forgot_password", authController.userForgotPassword);

module.exports = router;
