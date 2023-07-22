const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const jwt = require("jsonwebtoken"); // to check, if user already logged in
require("dotenv").config();
const bcrypt = require("bcrypt");

router.post("/setprofilepic", (req, res) => {
  const { email, profilepic } = req.body;
  console.log("email", email);
  console.log("profilepic", profilepic);

  if (!email || !profilepic) {
    return res.status(422).json({ error: "please fill all details" });
  } else {
    User.findOne({ email }).then(async (savedUser) => {
      if (savedUser) {
        savedUser.profilepic = profilepic;
        savedUser
          .save()
          .then((user) => {
            return res
              .status(200)
              .json({ message: "profile pic updated", uri: profilepic });
          })
          .catch((error) => {
            return res
              .status(200)
              .json({ error: "sorry, profile pic could not updated" });
          });
      } else {
        return res.status(422).json({ error: "emial is not available" });
      }
    });
  }
});

router.post("/addpost", (req, res) => {
  const { email, post, postdescription } = req.body;

  if (!email || !post) {
    return res.status(422).json({ error: "PLease select Image" });
  } else {
    User.findOne({ email })
      .then(async (savedUser) => {
        if (!savedUser) {
          return res.status(422).json({ error: "emial is not available" });
        }
        savedUser.posts.push({
          post,
          postdescription,
          likes: [],
          comments: [],
        });
        savedUser
          .save()
          .then((user) => {
            return res.status(200).json({ message: "post updated" });
          })
          .catch((error) => {
            return res
              .status(200)
              .json({ error: "sorry, post could not updated" });
          });
      })
      .catch((err) => {
        return res
          .status(422)
          .json({ error: "Failed to check email, server errors" });
      });
  }
});

router.post("/checkitem", (req, res) => {
  const { postdescription, email } = req.body;

  if (!postdescription) {
    return res.status(422).json({ error: "please fill all details" });
  } else {
    User.findOne({ email })
      .then(async (savedUser) => {
        if (!savedUser) {
          return res.status(422).json({ error: "emial is not available" });
        }
        savedUser.posts.push({
          post,
          postdescription,
          likes: [],
          comments: [],
        });
        savedUser
          .save()
          .then((user) => {
            return res
              .status(200)
              .json({ message: "post updated", uri: profilepic });
          })
          .catch((error) => {
            return res
              .status(200)
              .json({ error: "sorry, post could not updated" });
          });
      })
      .catch((err) => {
        return res
          .status(422)
          .json({ error: "Failed to check email, server errors" });
      });
  }
});
module.exports = router;
