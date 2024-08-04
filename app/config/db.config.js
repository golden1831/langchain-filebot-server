const mongoose = require('mongoose');

const MONGO_USERNAME = 'sammy';
const MONGO_PASSWORD = 'password';
const MONGO_HOSTNAME = '0.0.0.0';
const MONGO_PORT = '27017';
const MONGO_DB = 'TestDB';

const url = `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}`;
console.log(url, {
  useNewUrlParser: true,
  // useUnifiedTopology: true,
});
mongoose.connect(url)
  .then(() => console.log('Database successfuly to connected'))
  .catch(() => console.log('Database failed to connected'));
