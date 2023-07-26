const mongoose = require("mongoose");
const PostSchema = require("./Post");

const bcrypt = require("bcrypt"); // to save password with modification

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilepic: {
    type: String,
    default: "",
  },
  posts: {
    type: [PostSchema],
    default: [],
  },
  followers: {
    type: Array,
    default: [],
  },
  following: { type: Array, default: [] },
  description: {
    type: String,
    default: "",
  },
  allmessages: {
    type: Array,
    default: [],
  },
});
// to bcrypt the password
userSchema.pre("save", async function (next) {
  const user = this;
  console.log("password before hashing", user.password);
  if (!user.isModified("password")) {
    //if password is not modified
    return next();
  }

  user.password = await bcrypt.hash(user.password, 8); // to put in 8 sequence
  console.log("just before saving after hashing", user.password); // password is modified
  next();
});

mongoose.model("User", userSchema);
