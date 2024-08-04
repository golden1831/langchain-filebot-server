const express = require('express');
const cors = require("cors");
// const mongoose = require('mongoose');

const app = express();

var corsOptions = {
  origin:'*', //or whatever port your frontend is using
  // credentials:true,            
  // optionSuccessStatus:200
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());  /* bodyParser.json() is deprecated */

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));   /* bodyParser.urlencoded() is deprecated */

const db = require("./app/config/db.config");

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
  res.render('pages/auth');
});

require("./app/routes/chatbotRoutes")(app);
require("./app/routes/authUserRoutes")(app);
require("./app/routes/fileRoutes")(app);
require("./app/routes/pricingRoutes")(app);
require("./app/routes/settingRoutes")(app);
require("./app/routes/userRoutes")(app);
require("./app/routes/authAdminRoutes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
