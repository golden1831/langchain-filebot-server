const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const {
  NotFound,
  ServerError,
  UnAuthorized,
} = require("../constants/StatusCode");
const {
  NotFoundMsg,
  ServerErrorMsg,
  UnAuthorizedMsg,
} = require("../constants/StatusMessage");
const User = require("../models/User.model");
const { isEmpty } = require("lodash");

const authToken = (req, res, next) => {
  let token = req.headers["x-auth-token"];

  if (!token) {
    return res.status(403).send({
      message: "No User token provided!",
    });
  }

  jwt.verify(token, keys.secretOrKey, (err, decoded) => {
    if (err) {
      return res.status(UnAuthorized).send({
        message: UnAuthorizedMsg,
      });
    }

    User.findById(decoded.id)
      .then((user) => {
        if (isEmpty(user))
          return res.status(NotFound).json({ errors: NotFoundMsg });

        req.userId = user._id;
        req.email = user.email;
        console.log("User middleware success");
        return next();
      })
      .catch((err) => {
        return res.status(ServerError).json({
          message: err.message || ServerErrorMsg,
        });
      });
  });
};

module.exports = {
  authToken,
};
