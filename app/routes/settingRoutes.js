module.exports = app => {
	const settingController = require("../controllers/settingController");
	const { authToken } = require("../middleware/authToken");

	var router = require("express").Router();

	router.post("/add", [authToken], settingController.add);

	router.post("/", [authToken], settingController.findAll);

	router.get("/:id", [authToken], settingController.findOne);

	router.put("/:id", [authToken], settingController.update);

	router.delete("/:id", [authToken], settingController.delete);

	app.use("/api/bot_settings", router);
};