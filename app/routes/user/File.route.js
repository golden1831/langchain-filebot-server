const express = require("express");
const router = express.Router();
const {
  uploadAll,
  createAll,
  deleteOne,
} = require("../../controllers/File.controller");
const { authToken } = require("../../middleware/Auth.middleware");

const multer = require("multer");
const path = require("path");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/chatbot_file_upload");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage: storage });
const upload = multer({ dest: "public/chatbot_file_upload" });

router.post("/upload", upload.array("file"), uploadAll);

router.post("/add", createAll);

router.post("/delete", deleteOne);

module.exports = router;
