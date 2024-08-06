const express = require("express");
const router = express.Router();
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("../../controllers/Prompt.controller");
const { authToken } = require("../../middleware/Auth.middleware");

router.get("/list", getAll);

router.post("/add", createOne);

router.get("/:id", getOne);

router.put("/update/:id", updateOne);

router.delete("/delete/:id", deleteOne);

module.exports = router;
