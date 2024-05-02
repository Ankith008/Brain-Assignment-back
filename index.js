const express = require("express");
const app = express();
const cors = require("cors");
const connecttodb = require("./db");
const cookieParser = require("cookie-parser");
connecttodb();
app.use(express.json());
app.use(cors({ origin: "https://brain-assignment.vercel.app/" }));
app.use(cookieParser());
app.options("*",cors())
app.use("/auth", require("./routes/auth"));
app.use("/post", require("./routes/post"));
app.listen(5000);
