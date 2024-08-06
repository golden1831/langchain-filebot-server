const User = require("../models/User.model");
const Pricing = require("../models/Pricing.model");
const UserPrompt = require("../models/UserPrompt.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

const {
  Success,
  Created,
  Conflict,
  ServerError,
  NotFound,
  UnAuthorized,
} = require("../constants/StatusCode");
const {
  SuccessSMsg,
  CreatedMsg,
  ConflictMsg,
  ServerErrorMsg,
  NotFoundMsg,
  UnAuthorizedMsg,
} = require("../constants/StatusMessage");
const { isEmpty } = require("lodash");

const TOKEN_EXPIRY_TIME = 86400; // 24 hours
const defaultPrompt =
  "You are an AI assistant providing helpful answers based on the context to provide conversational answer without any prior knowledge. You are given the following extracted parts of a long document and a question. You can also ask the user to rephrase the question if you need more context. But don't try to make up an answer. If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context. Answer in a concise or elaborate format as per the intent of the question.";

const userLogin = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(NotFound).json({ message: NotFoundMsg });

    let flag = false;

    if (req.body.isGmail) {
      flag = true;
    } else {
      const result = await bcrypt.compare(
        req.body.password,
        user.password_hash
      );
      if (result) {
        flag = true;
      }
    }

    if (flag) {
      // const pricing = await Pricing.findById(user.pricing_id);

      let encodeData = {
        id: user._id,
        // chatbot: pricing.chatbot_count,
        // msg: pricing.message_count,
        // embed: pricing.embed_count,
        // pricing_name: pricing.name,
        // start: user.start,
        // end: user.end,
        pricing_priority: user.pricing_priority,
        name: user.name,
        email: user.email,
        isGmail: user.isGmail,
      };

      const token = jwt.sign(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          pricing_priority: user.pricing_priority,
        },
        keys.secretOrKey,
        {
          expiresIn: 86400,
        }
      );

      return res.send({ user: encodeData, token: token });
    } else {
      return res.status(UnAuthorized).json({ message: UnAuthorizedMsg });
    }
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

const userRegister = async (req, res) => {
  try {
    // Extracting user data from client request
    const userData = req.body;

    // Checking if the user already exists in the data base
    const user = await User.findOne({ email: userData.email });

    // Fetching pricing information
    // const pricing = await Pricing.findOne({ price: 0 });

    // If user already exists, send an error message
    if (!isEmpty(user)) {
      return res.status(Conflict).json({ message: ConflictMsg });
    }
    // If user doesn't exist, continue with registration
    else {
      const salt = await bcrypt.genSalt(10);

      let hashedPassword = "";
      if (userData.isGmail) {
        userData.password = "";
      } else {
        hashedPassword = await bcrypt.hash(userData.password, salt);
      }

      // Prepare the user data for creation
      const data = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password_hash: hashedPassword,
        isGmail: userData.isGmail,
        // pricing_id: pricing._id,
        start: new Date(),
        end: new Date(),
      };

      // Creating the user and saving to the DB
      const savedUser = await User.create(data);

      if (!isEmpty(savedUser)) {
        const createdPrompt = await UserPrompt.create({
          name: "Default",
          description: "Default",
          content: defaultPrompt,
          user_id: savedUser._id,
        });

        let encodeData = {
          id: savedUser._id,
          // chatbot: pricing.chatbot_count,
          // msg: pricing.message_count,
          // embed: pricing.embed_count,
          // pricing_name: pricing.name,
          start: savedUser.start,
          end: savedUser.end,
          name: savedUser.name,
          email: savedUser.email,
          isGmail: savedUser.isGmail,
        };

        const token = jwt.sign({ id: savedUser._id }, keys.secretOrKey, {
          expiresIn: 86400,
        });

        if (userData.isGmail) {
          return res.status(201).json({
            message: "Successfully created!",
            data: encodeData,
            token,
          });
        } else {
          return res.status(201).json({ message: "Successfully created!" });
        }
      }
    }
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

const userForgotPassword = async (req, res) => {
  try {
    const newData = req.body;

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(NotFound).json({ errors: NotFoundMsg });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newData.password, salt);

      const result = await User.findOneAndUpdate(
        { email: newData.email },
        { password: newData.password, password_hash: hashedPassword }
      );

      return res.send(result);
    }
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

module.exports = {
  userLogin,
  userRegister,
  userForgotPassword,
};
