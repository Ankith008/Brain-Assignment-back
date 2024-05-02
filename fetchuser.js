const jwt = require("jsonwebtoken");
const User = require("./model/User");
require("dotenv").config();

const fetchuser = async (req, res, next) => {
  const token = req.headers.braintoken;

  if (!token) {
    return res.json({ success: false, error: "Please Login to Add Post" });
  }
  try {
    const {
      user: { id },
    } = await jwt.decode(token, process.env.ENC_KEY);
    if (!id) {
      return res.json({ success: false, error: "Please Login" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.json({ success: false, error: "Please Login" });
    }
    if (!user.verify) {
      return res.json({ success: false, error: "Please Verify Your Email" });
    }
    req.user = id;
    next();
  } catch (error) {
    return res.json({ success: false, error: "Please Login" });
  }
};

module.exports = fetchuser;
