const Prompt = require("../models/Prompt.model");
const { isEmpty } = require("lodash");
const jwt = require("jsonwebtoken");
const {
  ServerError,
  BadRequest,
  Created,
  Success,
  NotFound,
} = require("../constants/StatusCode");
const {
  ServerErrorMsg,
  NotFoundMsg,
  CreatedMsg,
} = require("../constants/StatusMessage");

const getAll = async (req, res) => {
  try {
    const { prompt_category_id, page = 1, pageSize = 10 } = req.query;
    // let promptList = [];
    // let condition = prompt_category_id
    //   ? { prompt_category_id: new mongoose.Types.ObjectId(prompt_category_id) }
    //   : null;

    // promptList = await Prompt.aggregate([
    //   { $match: condition },
    //   {
    //     $lookup: {
    //       from: "prompt_categories",
    //       localField: "prompt_category_id",
    //       foreignField: "_id",
    //       as: "prompt_category_info",
    //     },
    //   },
    //   { $unwind: "$prompt_category_info" },
    //   {
    //     $project: {
    //       name: 1,
    //       description: 1,
    //       prompt_category_id: 1,
    //       prompt_category_name: "$prompt_category_info.name",
    //     },
    //   },
    //   // {
    //   //   $sort: {
    //   //     name: 1,
    //   //   },
    //   // },
    //   { $skip: (page - 1) * pageSize },
    //   { $limit: pageSize > count ? count : pageSize },
    // ]);

    const count = await Prompt.count();
    const promptList = await Prompt.find()
      .skip((page - 1) * pageSize)
      .limit(pageSize > count ? count : pageSize);

    return res.status(Success).json({ data: promptList, total: count });
  } catch (err) {
    return res.status(ServerError).json({ message: ServerErrorMsg });
  }
};

const createOne = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(BadRequest).json({
        message: "Content cannot be empty!",
      });
    }

    const createdPrompt = await Prompt.create(req.body);

    if (createdPrompt) {
      return res.status(Created).json({
        message: CreatedMsg,
      });
    } else {
      throw new Error("Prompt creation failed.");
    }
  } catch (err) {
    return res.status(ServerError).json({
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

const updateOne = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPrompt = await Prompt.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (isEmpty(updatedPrompt)) {
      return res.status(BadRequest).json({ message: "Failed" });
    }

    return res.status(Success).json({ message: "Success!" });
  } catch (err) {
    return res.status(ServerError).json({ message: ServerErrorMsg });
  }
};

const deleteOne = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPrompt = await Prompt.findByIdAndDelete(id);

    if (isEmpty(deletedPrompt))
      return res.status(BadRequest).json({ message: "Failed!" });

    return res.status(Success).json({ message: "Success!" });
  } catch (err) {
    return res.status(ServerError).json({ message: ServerErrorMsg });
  }
};

module.exports = {
  getAll,
  createOne,
  getOne,
  updateOne,
  deleteOne,
};
