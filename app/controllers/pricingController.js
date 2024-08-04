const isEmpty = require("is-empty");
const Pricing = require("../models/pricing.model");
const stripe = require("stripe")(process.env.STRIPE_PUBLIC_KEY);

exports.create = async (req, res) => {
  const { body } = req;
  // const amount = await Pricing.count({ where: { isDeleted: true } });
  await Pricing.create(body)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the User.",
      });
    });
};

exports.findAll = async (req, res) => {
  const options = req.query;

  if (!isEmpty(options)) {
    const count = await Pricing.count();
    if (count) {
      await Pricing.aggregate([
        { $skip: (options.page - 1) * options.pagesize },
        { $limit: options.pagesize > count ? count : options.pagesize },
      ])
        .then((data) => {
          res.send({
            result: data,
            total: count,
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
        total: count,
        success: true,
        pagination: { page: 1, count: 1 },
        token: req.headers["x-auth-token"],
      });
    }
  } else {
    await Pricing.find()
      .then((data) => {
        res.send({ result: data });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving tutorials.",
        });
      });
  }
};

// Update a Tutorial by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  const userData = req.body;

  await Pricing.findByIdAndUpdate(id, {
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
exports.delete = async (req, res) => {
  const id = req.params.id;

  await Pricing.findByIdAndDelete(id)
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

exports.findOne = (req, res) => {
  const id = req.params.id;

  Tutorial.findByPk(id)
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

exports.subscription = async (req, res) => {
  const seesion = await stripe.checkout.sessions.create({
    success_url: process.env.FRONT_URL,
    line_items: [
      {
        price: req.body.price_id,
        quantity: 1,
      },
    ],
    mode: "subscription",
  });
  if (seesion.status === "open") {
    return res.status(200).json({ url: seesion.url });
  } else {
    return res.status(500);
  }
};

exports.webhooks = async (req, res) => {
  const data = req;
  console.log(req);
};
