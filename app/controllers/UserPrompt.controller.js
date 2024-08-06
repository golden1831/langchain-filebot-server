const UserPrompt = require("../models/UserPrompt.model");
const mongoose = require("mongoose");
const { isEmpty } = require("lodash");
const {
  ServerError,
  BadRequest,
  Created,
  Success,
} = require("../constants/StatusCode");
const {
  ServerErrorMsg,
  NotFoundMsg,
  CreatedMsg,
  SuccessMsg,
} = require("../constants/StatusMessage");

const getAll = async (req, res) => {
  try {
    const { userId } = req;
    const { page = 1, pageSize = 10 } = req.query;

    const count = await UserPrompt.count({ user_id: userId });
    const promptList = await UserPrompt.find({ user_id: userId });

    return res.status(Success).json({ data: promptList, total: count });
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
      return res.status(BadRequest).json({
        message: "Content can not be empty!",
      });
    }

    const createdPrompt = await UserPrompt.create({
      ...req.body,
      user_id: userId,
    });

    if (isEmpty(createdPrompt)) {
      return res.status(BadRequest).json({ message: "Failed!" });
    }
    return res.status(Created).json({ message: CreatedMsg });
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

const getOne = async (req, res) => {
  try {
    const { id } = req.query;
    const prompt = await UserPrompt.findById(id);

    if (isEmpty(prompt)) {
      return res.status(BadRequest).json({ message: "Failed!" });
    }

    return res.status(Success).json({ data: prompt, message: SuccessMsg });
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

const updateOne = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPrompt = await UserPrompt.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (isEmpty(updatedPrompt)) {
      return res.status(BadRequest).json({ message: "Failed!" });
    }

    return res.status(Success).json({ message: "Success!" });
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

const deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPrompt = await UserPrompt.findByIdAndDelete(id);

    if (isEmpty(deletedPrompt))
      return res.status(BadRequest).json({ message: "Failed!" });

    return res.status(Success).json({ message: "Success!" });
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

module.exports = {
  getAll,
  createOne,
  getOne,
  updateOne,
  deleteOne,
};
