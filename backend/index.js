const express = require("express");
require("dotenv").config();
const { connectionDB } = require("./db");
const { userRouter } = require("./Routes/user.Router");
const { blogRouter } = require("./Routes/blog.Router");
const app = express();

// Middlewares
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Welcome to Blogging Application");
});

app.use("/users", userRouter);
app.use("/blogs", blogRouter);

app.listen(process.env.PORT, () => {
  connectionDB();
  console.log(`Server listening on port http://localhost:${process.env.PORT}`);
});
