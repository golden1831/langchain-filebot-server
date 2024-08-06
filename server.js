const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

var corsOptions = {
  origin: "*", //or whatever port your frontend is using
  // credentials:true,
  // optionSuccessStatus:200
};

// app.use(cors(["*"]));
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json()); /* bodyParser.json() is deprecated */

// parse requests of content-type - application/x-www-form-urlencoded
app.use(
  express.urlencoded({ extended: true })
); /* bodyParser.urlencoded() is deprecated */

const connectDB = require("./app/config/db.config");

connectDB();
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
  res.render("pages/auth");
});

app.use("/api", require("./app/routes"));

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
