const Setting = require("../models/setting.model");
const Chat = require("../models/chat.model");
const { PineconeClient } = require("@pinecone-database/pinecone");
const mongoose = require("mongoose");

exports.findAll = async (req, res) => {
  const userId = req.body.userId;
  var condition = userId
    ? { userId: new mongoose.Types.ObjectId(userId) }
    : null;

  await Setting.aggregate([
    { $match: condition },
    {
      $lookup: {
        from: "files",
        localField: "_id",
        foreignField: "chatbot_id",
        as: "files",
      },
    },
    {
      $lookup: {
        from: "chats",
        localField: "_id",
        foreignField: "chatbot_id",
        as: "histories",
      },
    },
    { $unwind: "$histories" },
  ])
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

// Create and Save a new Tutorial
exports.add = (req, res) => {
  // Validate request
  if (req.body === undefined) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  Setting.create({ userId: req.body.userId })
    .then(async (data) => {
      // const amount = await Pricing.count({ where: { isDeleted: false } });
      await Chat.create({ chatbot_id: data._id });
      res.send({
        message: "Settings was added successfully.",
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Tutorial.",
      });
    });
};

exports.update = (req, res) => {
  const id = req.params.id;

  Setting.findByIdAndUpdate(id, {
    $set: req.body,
  })
    .then(async (data) => {
      const send = await Setting.findById(id);
      if (send) {
        res.send(send);
      } else {
        res.send({
          message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Tutorial with id=" + id,
      });
    });
};

exports.findOne = (req, res) => {
  const id = req.params.id;

  Setting.findById(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Setting with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Setting with id=" + id,
      });
    });
};

exports.delete = async (req, res) => {
  const id = req.params.id;

  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

  await pineconeIndex.delete1({ deleteAll: true, namespace: `${id}` });

  await Setting.findByIdAndDelete(id)
    .then(async (data) => {
      await Chat.deleteOne({ chatbot_id: id });
      res.send({ message: "delete success" });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Tutorial with id=" + id,
      });
    });
};
