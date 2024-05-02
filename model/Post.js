const mongoose = require("mongoose");
const { Schema } = mongoose;

const PostSchema = new Schema({
  profile: {
    type: String,
    require: true,
  },
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Post", PostSchema);
