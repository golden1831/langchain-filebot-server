module.exports = app => {
	const authController = require("../controllers/authController");
	const createAdmin = require("../middleware/createAdmin");
	const { adminToken } = require("../middleware/authToken");

	var router = require("express").Router();

	router.post("/login",[createAdmin], authController.signIn);

	router.post("/change_password", [adminToken], authController.changePassword);

	app.use("/api/admin", router);
};
  