const mongoose = require("mongoose");
require("dotenv").config();

const connecttodb = async () => {
  try {
    await mongoose.connect(process.env.DB_LINK);
    console.log("connected to database");
  } catch (err) {
    console.log("unable to connnect to datbase");
  }
};

module.exports = connecttodb;
