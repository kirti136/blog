const mongoose = require("mongoose");

const blogSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

const BlogModel = mongoose.model("Blog", blogSchema);

module.exports = {
  BlogModel,
};
