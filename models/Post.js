const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  post: {
    type: String,
    required: true,
  },
  postdescription: {
    type: String,
    default: "",
  },
  likes: {
    type: Array,
    default: [],
  },
  comments: {
    type: Array,
    default: [],
  },
});

mongoose.model("Post", PostSchema);
