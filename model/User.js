const express = require("express");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  profile: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  verify: {
    type: Boolean,
    require: true,
  },
  posts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);
