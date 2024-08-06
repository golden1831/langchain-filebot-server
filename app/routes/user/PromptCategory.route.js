const express = require("express");
const router = express.Router();
const {
  getAll,
  createOne,
} = require("../../controllers/PromptCategory.controller");
const { authToken } = require("../../middleware/Auth.middleware");

router.get("/list", getAll);

// router.get("/:id", [authToken], chatHistoryController.getOne);

router.post("/add", createOne);

// router.put("/update/:id", [authToken], chatHistoryController.updateOne);

// router.delete("/delete/:id", [authToken], chatHistoryController.deleteOne);

module.exports = router;
