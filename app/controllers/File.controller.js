const File = require("../models/File.model");
const { Pinecone } = require("@pinecone-database/pinecone");
const { PineconeStore } = require("@langchain/pinecone");
const { OpenAIEmbeddings } = require("@langchain/openai");

const fs = require("fs");
const pdfParse = require("pdf-parse");
const mongoose = require("mongoose");
const { isEmpty } = require("lodash");
const path = require("path");
const { ServerError } = require("../constants/StatusCode");
const { ServerErrorMsg } = require("../constants/StatusMessage");

const uploadAll = async (req, res) => {
  try {
    const { files } = req;
    const { id } = req.query;
    let fileName = "";

    files.forEach((file) => {
      const targetPath = path.resolve(
        __dirname,
        "../../public/chatbot_file_upload/",
        id + "-" + file.originalname
      );
      fileName = id + "-" + file.originalname;
      console.log(targetPath);

      // Append chunk to the target file
      fs.appendFileSync(targetPath, fs.readFileSync(file.path));
      fs.unlinkSync(file.path); // Remove the chunk file
    });

    res.send(fileName);
  } catch (error) {
    throw new Error(error);
  }
};

const createAll = async (req, res) => {
  const { userId } = req;
  const { fileList } = req.body;
  try {
    if (!req.body) {
      return res.status(400).json({
        message: "Content can not be empty!",
      });
    }

    const files = fileList.map((item) => ({
      name: item.fileName,
      original_name: item.originalName,
      path: "public/chatbot_file_upload",
      user_id: userId,
      isDeleted: false,
    }));

    const createdFiles = await File.insertMany(files);
    console.log(createdFiles);

    if (!isEmpty(createdFiles)) {
      return res.status(201).send({
        message: "Files was added successfully.",
        data: createdFiles,
      });
    } else {
      return res.status(200).send({
        message: "Files wasn't added.",
      });
    }
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

const deleteOne = async (req, res) => {
  try {
    const { id } = req.body;

    let file = await File.findById(id);

    if (file.status === 1) {
      const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
      const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

      // const deleteRequest = {
      //   filter: { id: `${file._id}`, type: "file" },
      //   // namespace: `${file.chatbot_id}`,
      // };
      // console.log(deleteRequest);
    } else {
      try {
        fs.unlinkSync(`${file.path}/${file.name}`);
        console.log("Delete file success");
      } catch (err) {
        console.log("Delete file error");
      }
    }

    await File.findByIdAndDelete(id);

    return res.status(200).json({ message: "Success" });
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

module.exports = {
  uploadAll,
  createAll,
  deleteOne,
};
