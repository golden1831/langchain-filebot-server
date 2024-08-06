const User = require("../models/User.model");
const { isEmpty } = require("lodash");
const Pricing = require("../models/Pricing.model");
const stripe = require("stripe")(process.env.STRIPE_PUBLIC_KEY);
const {
  Success,
  Created,
  Conflict,
  ServerError,
} = require("../constants/StatusCode");
const {
  SuccessSMsg,
  CreatedMsg,
  ConflictMsg,
  ServerErrorMsg,
} = require("../constants/StatusMessage");

const createOne = (req, res) => {
  const { body } = req;

  Pricing.create(body)
    .then((data) => {
      return res.send(data);
      // res.status(200).json({ data });
    })
    .catch((err) => {
      return res.status(ServerError).json({
        message: err.message || ServerErrorMsg,
      });
    });
};

const getAll = async (req, res) => {
  const options = req.query;

  try {
    if (!isEmpty(options)) {
      const count = await Pricing.count();
      if (count) {
        await Pricing.aggregate([
          {
            $sort: {
              price: 1,
            },
          },
          { $skip: (options.page - 1) * options.pagesize },
          { $limit: options.pagesize > count ? count : options.pagesize },
        ])
          .then((data) => {
            return res.send({
              result: data,
              total: count,
              success: true,
              pagination: { page: 1, count: 1 },
              token: req.headers["x-admin-token"],
            });
          })
          .catch((err) => {
            res.status(500).send({
              message: err.message || ServerErrorMsg,
            });
          });
      } else {
        return res.status(SUCCESS).json({
          result: [],
          total: count,
          success: true,
          pagination: { page: 1, count: 1 },
          token: req.headers["x-admin-token"],
        });
      }
    } else {
      await Pricing.find()
        .sort("price")
        .then((data) => {
          return res.status(200).json({ result: data });
        })
        .catch((err) => {
          return res.status(500).json({
            message: err.message || ServerErrorMsg,
          });
        });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

const subscription = async (req, res) => {
  const { userId, email } = req;

  // const userinfo = await User.findById(userId);

  const seesion = await stripe.checkout.sessions.create({
    success_url: process.env.FRONT_URL,
    customer_email: email,
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

const webhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];
  const data = request.body;
  if (data.type === "invoice.payment_succeeded") {
    // console.log(data.data.object.billing_details);
    // console.log("amount - ", data.data.object.amount_paid);

    // let billInfo = data.data.object.billing_details;
    let customer_email = data.data.object.customer_email;
    let amount_paid = data.data.object.amount_paid;
    // let pricingData = await Pricing.findOne({
    //   price: amount_paid > 0 ? amount_paid / 100 : 0,
    // });
    // console.log(pricingData);
    // if (!isEmpty(pricingData)) {
    let start = new Date();
    let end = new Date();
    if (amount_paid > 0) {
      end.setMonth(end.getMonth() + 1);
    }
    let userData = await User.findOneAndUpdate(
      { email: customer_email },
      {
        $set: {
          // pricing_id: pricingData._id,
          start: start,
          end: end,
          pricing_priority: 2,
        },
      }
    );
    // console.log(userData);
    if (!isEmpty(userData)) {
      response.send("Success!");
    }
    // } else {
    //   response.send("Fail!");
    // }
  }
  // let event;
  // const endpointSecret = "whsec_kkKUAmJWvwXb18SC9FdoGsszNh9S7IyT";
  // try {
  //   event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  // } catch (err) {
  //   response.status(400).send(`Webhook Error: ${err.message}`);
  //   return;
  // }
  // console.log(chargeSucceeded);

  // // Handle the event
  // switch (event.type) {
  //   case "charge.expired":
  //     const chargeExpired = event.data.object;
  //     // Then define and call a function to handle the event charge.expired
  //     break;
  //   case "charge.failed":
  //     const chargeFailed = event.data.object;
  //     // Then define and call a function to handle the event charge.failed
  //     break;
  //   case "charge.pending":
  //     const chargePending = event.data.object;
  //     // Then define and call a function to handle the event charge.pending
  //     break;
  //   case "charge.refunded":
  //     const chargeRefunded = event.data.object;
  //     // Then define and call a function to handle the event charge.refunded
  //     break;
  //   case "charge.succeeded":
  //     const chargeSucceeded = event.data.object;
  //     console.log(chargeSucceeded);
  //     // Then define and call a function to handle the event charge.succeeded
  //     break;
  //   // ... handle other event types
  //   default:
  //     console.log(`Unhandled event type ${event.type}`);
  // }

  // Return a 200 response to acknowledge receipt of the event
  // response.send();
};

module.exports = {
  getAll,
  subscription,
  webhooks,
};
