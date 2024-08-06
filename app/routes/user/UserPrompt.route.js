const express = require("express");
const router = express.Router();
const {
  getAll,
  createOne,
  getOne,
  updateOne,
  deleteOne,
} = require("../../controllers/UserPrompt.controller");
const { authToken } = require("../../middleware/Auth.middleware");

router.get("/list", [authToken], getAll);

router.post("/add", [authToken], createOne);

router.get("/:id", [authToken], getOne);

router.put("/update/:id", [authToken], updateOne);

router.delete("/:id", [authToken], deleteOne);

module.exports = router;
