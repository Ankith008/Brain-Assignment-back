const express = require("express");
const router = express.Router();
const Post = require("../model/Post");
const User = require("../model/User");
const multer = require("multer");
const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single("profile");
const { v4: uuid } = require("uuid");
const { v2: cloudinary } = require("cloudinary");
const fetchuser = require("../fetchuser");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

router.post("/createpost", fetchuser, multerUploads, async (req, res) => {
  try {
    let unique = uuid();
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "Brain User",
      public_id: unique,
    });
    const url = result.secure_url;
    const { title, description } = req.body;
    let post = new Post({
      title: title,
      description: description,
      profile: url,
      creator: req.user.id,
    });
    await post.save();

    const user = await User.findByIdAndUpdate(
      req.user,
      {
        $push: { posts: post._id },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Post Created",
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: "Post Not Created",
    });
  }
});

router.get("/getpost/:page", fetchuser, async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    let posts = await Post.find({}).skip(skip).limit(limit);
    res.json({
      success: true,
      posts: posts,
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      error: "Post Not Found",
    });
  }
});

module.exports = router;
