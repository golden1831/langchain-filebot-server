module.exports = (app) => {
  const authController = require("../controllers/authController");

  var router = require("express").Router();

  router.post("/register", authController.register);

  router.post("/login", authController.login);

  router.post("/forgot_password", authController.forgotPassword);

  app.use("/api/users", router);
};
