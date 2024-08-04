const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const { NOTFOUND, SERVERERROR } = require("../constants/errorCode");
const { NOTFOUNDMSG, SERVERERRORMSG } = require("../constants/errorMessage");
const User = require("../models/user.model");

authToken = (req, res, next) => {
  let token = req.headers["x-auth-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token, keys.secretOrKey, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }

    User.findOne({ _id: decoded.id })
      .then((user) => {
        if (!user) return res.status(NOTFOUND).json({ errors: NOTFOUNDMSG });
        req.user = user;
        console.log("middleware success");
        return next();
      })
      .catch((err) => {
        return res.status(SERVERERROR).json({ message: SERVERERRORMSG });
      });
  });
};

adminToken = (req, res, next) => {
  let token = req.headers["x-auth-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token, keys.secretOrKey, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }

    User.findOne({ _id: decoded.id, isAdmin: decoded.isAdmin })
      .then((user) => {
        if (!user) return res.status(NOTFOUND).json({ errors: NOTFOUNDMSG });
        req.user = user;
        console.log("middleware success");
        return next();
      })
      .catch((err) => {
        return res.status(SERVERERROR).json({ message: SERVERERRORMSG });
      });
  });
};

module.exports = {
  authToken,
  adminToken,
};
