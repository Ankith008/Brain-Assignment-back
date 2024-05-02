const express = require("express");
const User = require("../model/User");
const Post = require("../model/Post");
const multer = require("multer");
const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single("profile");
const { v4: uuidv4 } = require("uuid");
const { v2: cloudinary } = require("cloudinary");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const router = express.Router();
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//usersignup

router.post(
  "/createuser",
  multerUploads,
  [
    body("name").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.json({
        success: false,
        error: "Input Requirement is not fulfilled",
      });
    }
    try {
      let unique = uuidv4();
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "Brain User",
        public_id: unique,
      });
      const url = result.secure_url;
      const { name, email, password } = req.body;
      let user = await User.findOne({ email: email });
      if (user) {
        return res.status(409).json({
          success: false,
          error: "User Already Present please try to login",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const secpass = await bcrypt.hash(password, salt);

      user = await User.create({
        profile: url,
        name: name,
        email: email,
        password: secpass,
        verify: false,
      });

      // Send verification request to email
      const verificationToken = jwt.sign({ email }, process.env.ENC_KEY, {
        expiresIn: "1d",
      });
      const verificationLink = `http://localhost:5000/verify?token=${verificationToken}`;

      // Create a nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });

      const mailOptions = {
        from: "Brain_Assignment",
        to: email,
        subject: "Account Verification",
        text: `Please click on the following link to verify your account:  `,
        html: ` <a href=${verificationLink}>Click Here to Verify</a>

      `, // html body
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.json({
            success: false,
            error: "Failed to send verification email",
          });
        } else {
          console.log("Email sent: " + info.response);
          return res.json({ success: true, verificationLink });
        }
      });
    } catch (error) {
      console.log(error);
      return res.json({ success: false, error: "Internal Server Issue" });
    }
  }
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 5 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ success: false, error: "Enter Valid Creadintials" });
    }
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "Not Found User" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.json({
          success: false,
          error: "Please Enter the Valid Credencials",
        });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const BrainToken = jwt.sign(data, process.env.ENC_KEY, {
        expiresIn: "15d",
      });
      return res.json({ success: true, BrainToken });
    } catch (err) {
      console.log(err);
      return res.json({ success: false, error: "Internal server Issue" });
    }
  }
);

router.get("/verify", async (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.json({ success: false, error: "Invalid Token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.ENC_KEY);
    const email = decoded.email;

    await User.findOneAndUpdate({ email }, { verify: true });
    return res.json({
      success: true,
      message: "Email is Verified , Check the Site ",
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, error: "Invalid Token" });
  }
});
module.exports = router;
