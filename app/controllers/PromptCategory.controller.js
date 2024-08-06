const PromptCategory = require("../models/PromptCategory.model");
const { isEmpty } = require("lodash");
const jwt = require("jsonwebtoken");
const { ServerError, Created, Success } = require("../constants/StatusCode");
const {
  ServerErrorMsg,
  NotFoundMsg,
  CreatedMsg,
} = require("../constants/StatusMessage");

const getAll = async (req, res) => {
  try {
    const promptCategoryList = await PromptCategory.find().select("name");

    if (isEmpty(promptCategoryList)) {
      return res.status(Success).json({
        data: [],
      });
    }

    return res.status(Success).json({ data: promptCategoryList });
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

const createOne = async (req, res) => {
  try {
    const createdPromptCategory = await PromptCategory.create(req.body);

    if (createdPromptCategory) {
      return res.status(Created).json({
        message: CreatedMsg,
      });
    } else {
      throw new Error("PromptCategory creation failed.");
    }
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

const updateOne = async (req, res) => {
  const id = req.params.id;
  try {
    const updatedChatHistory = await Chat.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedChatHistory) {
      return res.status(404).json({
        message: NotFoundMsg,
      });
    }

    return res.status(200).json(updatedChatHistory);
  } catch (err) {
    return res.status(500).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

const getOne = async (req, res) => {
  const id = req.params.id;
  try {
    const chatHistory = await Chat.findById(id);

    if (!chatHistory) {
      return res.status(200).json({
        message: NotFoundMsg,
      });
    }

    return res.status(200).json({ data: chatHistory });
  } catch (err) {
    return res.status(500).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

const deleteOne = async (req, res) => {
  const id = req.params.id;
  try {
    await Chat.findByIdAndDelete(id);

    return res.status(200).json({ message: "Success!" });
  } catch (err) {
    return res.status(ServerError).json({ message: ServerErrorMsg });
  }
};

module.exports = {
  getAll,
  createOne,
  updateOne,
  getOne,
  deleteOne,
};
