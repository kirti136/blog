const { Router } = require("express");
const { BlogModel } = require("../Models/BlogModel");
const { authMiddleware } = require("../Middlewares/auth.Middleware");
const blogRouter = Router();
const jwt = require("jsonwebtoken");

// Read all Blogs
blogRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await BlogModel.find();
    res.status(200).send({ user });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Add Blogs
blogRouter.post("/addblog", authMiddleware, async (req, res) => {
  try {
    const { title, description, author } = req.body;

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decodedToken;

    author = userId;
    const blog = new BlogModel({ title, description, author });
    await blog.save();
    res.status(201).send({ message: "Blog Added" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Update Blog
blogRouter.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await BlogModel.findByIdAndUpdate(req.params.id, req.body);

    if (!blog) {
      return res.status(400).send({ message: "Blog Not Found" });
    } else {
      res.status(200).send({ message: "Blog Updated successfully!" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// Delete Blog
blogRouter.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await BlogModel.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(400).send({ message: "Blog Not Found" });
    }
    res.status(200).send({ message: "Blog Deleted" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = {
  blogRouter,
};
