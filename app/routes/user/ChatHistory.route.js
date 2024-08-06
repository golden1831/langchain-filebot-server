const express = require("express");
const router = express.Router();
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("../../controllers/ChatHistory.controller");
const { authToken } = require("../../middleware/Auth.middleware");

router.get("/list", [authToken], getAll);

router.get("/:id", [authToken], getOne);

router.post("/add", [authToken], createOne);

router.put("/update/:id", [authToken], updateOne);

router.delete("/delete/:id", [authToken], deleteOne);

module.exports = router;
