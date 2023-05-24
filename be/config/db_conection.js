const mongoose = require('mongoose');
require('dotenv').config();
const { DB_URL } = require('./config');

const dbConnection = async () => {
  mongoose.set('strictQuery', false);
  mongoose
    .connect(DB_URL)
    .then(() => console.log('Connected to mongoDB'))
    .catch((error) => console.log(error));
};

module.exports = dbConnection;