const User = require("../models/user.model");
const Pricing = require("../models/pricing.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

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

// Admin panel
exports.signIn = async (req, res) => {
  const user = await User.findOne({ email: req.body.email, isAdmin: 1 });
  if (!user) return res.status(NOTFOUND).json({ message: NOTFOUNDMSG });

  const result = await bcrypt.compare(req.body.password, user.password);

  if (result) {
    const token = jwt.sign({ id: user._id, isAdmin: 1 }, keys.secretOrKey, {
      expiresIn: 86400,
    });

    return res.status(SUCCESS).json({ success: true, token: token });
  } else {
    return res
      .status(EMAILORPASSWORDINVAID)
      .json({ message: EMAILORPASSWORDINVAIDMSG });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const newData = req.body;

    let token = req.headers["x-auth-token"];

    jwt.verify(token, keys.secretOrKey, async (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Unauthorized!",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newData.password, salt);
      newData.password = hash;

      User.findByIdAndUpdate(decoded.id, { $set: newData })
        .then((user) => {
          return res.status(SUCCESS).json({ message: SUCCESSMSG });
        })
        .catch((err) => {
          return res.status(SERVERERROR).json({ message: SERVERERRORMSG });
        });
    });
  } catch (error) {
    return res.status(SERVERERROR).json({ message: SERVERERRORMSG });
  }
};

// User panel
exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(NOTFOUND).json({ message: NOTFOUNDMSG });

    let flag = false;

    if (req.body.isGmail) {
      flag = true;
    } else {
      const result = await bcrypt.compare(req.body.password, user.password);
      if (result) {
        flag = true;
      }
    }

    if (flag) {
      const pricing = await Pricing.findById(user.pricing_id);

      const token = jwt.sign(
        {
          id: user._id,
          chatbot: pricing.chatbot_count,
          msg: pricing.message_count,
          pdf: pricing.pdf_count,
          character: pricing.character_count,
          start: user.start,
          end: user.end,
        },
        keys.secretOrKey,
        { expiresIn: 86400 }
      );

      return res.send({ user: user, token: token });
    } else {
      return res
        .status(EMAILORPASSWORDINVAID)
        .json({ message: EMAILORPASSWORDINVAIDMSG });
    }
  } catch (error) {
    return res.status(SERVERERROR).json({ message: SERVERERRORMSG });
  }
};

exports.register = async (req, res) => {
  try {
    const userData = req.body;

    if (!req.body.isGmail) {
      const { errors, isValid } = validateRegisterInput(userData);

      if (!isValid) {
        return res.status(EMAILORPASSWORDINVAID).json({ message: errors });
      }
    } else {
      userData.password = keys.secretOrKey;
    }

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
        isGmail: userData.isGmail,
        pricing_id: pricing._id,
        start: new Date(),
        end: new Date(),
      };
      const result = await User.create(data);

      return res.status(SUCCESS).json(result);
    }
  } catch (error) {
    return res.status(SERVERERROR).json({ message: SERVERERRORMSG });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const newData = req.body;
    const { errors, isValid } = validateForgotInput(newData);

    if (!isValid) {
      return res.status(EMAILORPASSWORDINVAID).json({ errors: errors });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(NOTFOUND).json({ errors: NOTFOUNDMSG });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newData.password, salt);
      newData.password = hash;
      const result = await User.findOneAndUpdate(
        { email: newData.email },
        { password: newData.password }
      );

      return res.status(SUCCESS).json(result);
    }
  } catch (error) {
    return res.status(SERVERERROR).json({ message: SERVERERRORMSG });
  }
};
