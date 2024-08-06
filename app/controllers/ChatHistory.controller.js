const Chat = require("../models/Chat.model");
const AdvancedChat = require("../models/AdvancedChat.model");
const Prompt = require("../models/Prompt.model");
const UserPrompt = require("../models/UserPrompt.model");
const mongoose = require("mongoose");
const { isEmpty } = require("lodash");
const { ServerError } = require("../constants/StatusCode");
const { ServerErrorMsg, NotFoundMsg } = require("../constants/StatusMessage");

const getAll = async (req, res) => {
  try {
    const { userId } = req;
    const { chatLevel } = req.query;

    let chatHistoryList = [];
    if (parseInt(chatLevel) === 0)
      chatHistoryList = await Chat.find({ user_id: userId }).select("name");
    else
      chatHistoryList = await AdvancedChat.find({ user_id: userId }).select(
        "name"
      );

    if (isEmpty(chatHistoryList)) {
      return res.status(200).json({
        message: NotFoundMsg,
        data: [],
      });
    }

    return res.status(200).json({ data: chatHistoryList });
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

const createOne = async (req, res) => {
  try {
    const { userId } = req;

    if (!req.body) {
      return res.status(400).json({
        message: "Content can not be empty!",
      });
    }

    const { prompt_type, prompt_id, chatLevel } = req.body;

    let createdChatHistory = {};
    if (parseInt(chatLevel) === 0)
      createdChatHistory = await Chat.create({
        name: "New Conversation",
        user_id: userId,
        prompt_type: prompt_type,
        prompt_id: prompt_id,
      });
    else
      createdChatHistory = await AdvancedChat.create({
        name: "New Conversation",
        user_id: userId,
        prompt_type: prompt_type,
        prompt_id: prompt_id,
      });

    if (createdChatHistory) {
      return res.status(201).json({
        message: "Settings was added successfully.",
      });
    } else {
      throw new Error("Setting not created");
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
    const { chatLevel } = req.body;

    let updatedChatHistory = {};
    if (parseInt(chatLevel) === 0)
      updatedChatHistory = await Chat.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );
    else
      updatedChatHistory = await AdvancedChat.findByIdAndUpdate(
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
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

const getOne = async (req, res) => {
  const id = req.params.id;
  try {
    const { chatLevel } = req.query;

    let chatHistory = {};
    let promptData = {};
    if (parseInt(chatLevel) === 0) {
      chatHistory = await Chat.findById(id);
      if (chatHistory.prompt_type === 0) {
        promptData = await UserPrompt.findById(chatHistory?.prompt_id);
      } else {
        promptData = await Prompt.findById(chatHistory?.prompt_id);
      }
    } else {
      chatHistory = await AdvancedChat.findById(id);
      if (chatHistory.prompt_type === 0) {
        promptData = await UserPrompt.findById(chatHistory?.prompt_id);
      } else {
        promptData = await Prompt.findById(chatHistory?.prompt_id);
      }
    }

    if (!chatHistory) {
      return res.status(200).json({
        message: NotFoundMsg,
      });
    }

    return res
      .status(200)
      .json({ data: chatHistory, prompt_content: promptData?.content });
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

const deleteOne = async (req, res) => {
  const id = req.params.id;
  try {
    const { chatLevel } = req.query;

    let deletedChatHistory = {};
    if (parseInt(chatLevel) === 0)
      deletedChatHistory = await Chat.findByIdAndDelete(id);
    else deletedChatHistory = await AdvancedChat.findByIdAndDelete(id);

    if (!deletedChatHistory) {
      return res.status(200).json({
        message: NotFoundMsg,
      });
    }

    return res.status(200).json({ message: "Success!" });
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

module.exports = {
  getAll,
  createOne,
  updateOne,
  getOne,
  deleteOne,
};
