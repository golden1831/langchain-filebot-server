const { NOTFOUND, SERVERERROR } = require("../constants/errorCode");
const { NOTFOUNDMSG, SERVERERRORMSG } = require("../constants/errorMessage");
const User = require("../models/user.model");
const adminInfo = require("../config/adminInfo");
const bcrypt = require("bcryptjs");

createAdmin = async (req, res, next) => {
  const data = adminInfo.data;
  console.log(data);
  await User.findOne({ email: data.email, isAdmin: 1 })
    .then(async (user) => {
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(data.password, salt);
        data.password = hash;
        const real = {
          name: data.name,
          email: data.email,
          password: data.password ? data.password : "",
          isAdmin: data.isAdmin,
        };
        const result = await User.create(real);
      }
    })
    .catch((err) => {
      return res.status(SERVERERROR).json({ message: SERVERERRORMSG });
    });

  return next();
};

module.exports = createAdmin;
