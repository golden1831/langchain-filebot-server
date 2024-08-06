const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const { isEmpty } = require("lodash");
const {
  SUCCESS,
  ServerError,
  NOTFOUND,
  EMAILORPASSWORDINVAID,
  EXIST,
} = require("../constants/StatusCode");
const {
  SUCCESSMSG,
  ServerErrorMsg,
  NOTFOUNDMSG,
  EMAILORPASSWORDINVAIDMSG,
  EXISTMSG,
} = require("../constants/StatusMessage");

const updateOneByUser = async (req, res) => {
  try {
    const userData = req.body;
    const { userId } = req;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    userData.password_hash = hashedPassword;

    let user = await User.findByIdAndUpdate(userId, {
      $set: userData,
    });

    // let user = await User.findById(id);

    if (!isEmpty(user)) {
      // let pricingData = await Pricing.findById(user.pricing_id);
      // if (!isEmpty(pricingData)) {
      return res.status(200).json({
        data: {
          id: user._id,
          // chatbot: pricingData.chatbot_count,
          // msg: pricingData.message_count,
          // pdf: pricingData.pdf_count,
          // character: pricingData.character_count,
          // pricing_name: pricingData.name,
          start: user.start,
          end: user.end,
          name: user.name,
          email: user.email,
          isGmail: user.isGmail,
        },
        message: "Updated successfully.",
      });
      // } else {
      //   return res.status(404).send({
      //     message: `Not founds`,
      //   });
      // }
    } else {
      return res.status(404).send({
        message: `Not found.`,
      });
    }
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

const getOne = async (req, res) => {
  try {
    const { userId } = req;

    console.log(req);
    let userData = await User.findById(userId);
    if (!isEmpty(userData)) {
      // let pricingData = await Pricing.findById(userData.pricing_id);
      // if (!isEmpty(pricingData)) {
      return res.send({
        id: userData._id,
        // chatbot: pricingData.chatbot_count,
        // msg: pricingData.message_count,
        // embed: pricingData.embed_count,
        // character: pricingData.character_count,
        // pricing_name: pricingData.name,
        start: userData.start,
        end: userData.end,
        name: userData.name,
        email: userData.email,
        isGmail: userData.isGmail,
      });
      // } else {
      //   return res.status(404).send({
      //     message: `Cannot find User with id=${id}.`,
      //   });
      // }
    } else {
      return res.status(404).send({
        message: `Cannot find User.`,
      });
    }
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

module.exports = {
  updateOneByUser,
  getOne,
};
