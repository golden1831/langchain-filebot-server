const User = require("../models/user.model");
const Pricing = require("../models/pricing.model");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateForgotInput = require("../../validation/forgot");
const {
  SUCCESS,
  SERVERERROR,
  NOTFOUND,
  EMAILORPASSWORDINVAID,
  EXIST,
} = require("../constants/errorCode");
const {
  SUCCESSMSG,
  SERVERERRORMSG,
  NOTFOUNDMSG,
  EMAILORPASSWORDINVAIDMSG,
  EXISTMSG,
} = require("../constants/errorMessage");

exports.update_by_user = async (req, res) => {
  const id = req.params.id;
  const userData = req.body;
  const { errors, isValid } = validateRegisterInput(userData);

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(userData.password, salt);
  userData.password = hash;

  if (!isValid) {
    return res.status(EMAILORPASSWORDINVAID).json({ errors: errors });
  }

  await User.findByIdAndUpdate(id, {
    $set: userData,
  })
    .then((data) => {
      if (data) {
        res.send({
          message: "User was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating User with id=" + id,
      });
    });
};

exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findById(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Tutorial with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Tutorial with id=" + id,
      });
    });
};

exports.findAll = async (req, res) => {
  const options = req.query;

  let condition = {
    $or: [
      { name: { $regex: options.search } },
      { email: { $regex: options.search } },
    ],
  };
  const priceFilter =
    options.filter !== "All"
      ? { $match: { pricing_id: new mongoose.Types.ObjectId(options.filter) } }
      : { $match: {} };

  const count = await User.aggregate([
    { $match: { isAdmin: 0 } },
    { $match: condition },
    priceFilter,
    {
      $lookup: {
        from: "pricings",
        localField: "pricing_id",
        foreignField: "_id",
        as: "pricings",
      },
    },
    { $unwind: "$pricings" },
  ]);

  if (count.length) {
    await User.aggregate([
      { $match: { isAdmin: 0 } },
      { $match: condition },
      priceFilter,
      {
        $lookup: {
          from: "pricings",
          localField: "pricing_id",
          foreignField: "_id",
          as: "pricings",
        },
      },
      { $unwind: "$pricings" },
      { $skip: (options.page - 1) * options.pagesize },
      {
        $limit:
          options.pagesize > count.length ? count.length : options.pagesize,
      },
    ])
      .then((data) => {
        res.status(SUCCESS).json({
          result: data,
          total: count.length,
          success: true,
          pagination: { page: 1, count: 1 },
          token: req.headers["x-auth-token"],
        });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving tutorials.",
        });
      });
  } else {
    res.status(SUCCESS).json({
      result: [],
      total: count.length,
      success: true,
      pagination: { page: 1, count: 1 },
      token: req.headers["x-auth-token"],
    });
  }
};

exports.create_by_admin = async (req, res) => {
  try {
    const userData = req.body;

    const user = await User.findOne({ email: userData.email });

    const pricing = await Pricing.findOne({ price: 0 });
    if (user) {
      return res.status(EXIST).json({ message: EXISTMSG });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(userData.password, salt);
      userData.password = hash;
      const data = {
        name: userData.name,
        email: userData.email,
        password: userData.password ? userData.password : "",
        pricing_id: pricing._id,
      };

      const result = await User.create(data);

      return res.status(SUCCESS).json(result);
    }
  } catch (error) {
    return res.status(SERVERERROR).json({ message: SERVERERRORMSG });
  }
};

// Update a Tutorial by the id in the request
exports.update_by_admin = async (req, res) => {
  const id = req.params.id;
  const userData = req.body;

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(userData.password, salt);
  userData.password = hash;

  await User.findByIdAndUpdate(id, {
    $set: userData,
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Tutorial was updated successfully.",
        });
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

// Delete a Tutorial with the specified id in the request
exports.delete_by_admin = (req, res) => {
  const id = req.params.id;

  User.findByIdAndDelete(id)
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Tutorial was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Tutorial with id=" + id,
      });
    });
};
