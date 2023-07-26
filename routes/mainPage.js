const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Post = mongoose.model("Post");
const jwt = require("jsonwebtoken"); // to check, if user already logged in
require("dotenv").config();
const bcrypt = require("bcrypt");

router.post("/getposts", async (req, res) => {
  const { useremail } = req.body;

  if (!useremail) {
    return res.status(422).json({ error: "please enter email" });
  }

  try {
    const savedUser = await User.findOne({ email: useremail });

    if (!savedUser) {
      return res.status(422).json({ error: "User not exist" });
    }

    const friendposts = await Promise.all(
      savedUser.following.map(async (item) => {
        const otheruser = await User.findOne({ email: item });

        if (!otheruser) {
          return null;
        }

        return otheruser.posts.map((post) => ({
          _id: otheruser._id,
          username: otheruser.username,
          description: otheruser.description,
          email: otheruser.email,
          profilepic: otheruser.profilepic,
          followers: otheruser.followers,
          following: otheruser.following,
          post: post.post,
          likes: post.likes,
          comments: post.comments,
          postdescription: post.postdescription,
        }));
      })
    );

    return res
      .status(200)
      .json({ message: "got the post", friendpostss: friendposts.flat() });
  } catch (err) {
    console.error("Error fetching friend posts:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/likecheck", async (req, res) => {
  const { likerEmail, postOwnerEmail, postPhotoLink } = req.body;

  if (!likerEmail || !postOwnerEmail || !postPhotoLink) {
    return res
      .status(422)
      .json({ error: "Please provide all required fields" });
  } else {
    try {
      // Find the user who is going to like the post
      const likerUser = await User.findOne({ email: likerEmail });
      if (!likerUser) {
        return res.status(404).json({ error: "Liker user not found" });
      } else {
        const postOwnerUser = await User.findOne({ email: postOwnerEmail });
        if (!postOwnerUser) {
          return res.status(404).json({ error: "Post owner user not found" });
        } else {
          // Find the post in the postOwnerUser's posts array with the given photo link

          const likedPost = postOwnerUser.posts.find(
            (post) => post.post === postPhotoLink
          );

          if (!likedPost) {
            return res
              .status(404)
              .json({ error: "Post not found with the given photo link" });
          } else {
            // Check if the liker's email is not already in the likes array of the post
            if (likedPost.likes.includes(likerEmail)) {
              // likedPost.likes.splice(likerEmail);
              // postOwnerUser.markModified("posts");
              // // Save the updated postOwnerUser
              // postOwnerUser.save();
              // console.log("code is also running here");
              return res.status(200).json({ message: "User has liked this" });
            } else {
              // Add the liker's email to the likes array of the post
              // likedPost.likes.push(likerEmail);
              // postOwnerUser.markModified("posts");
              // // Save the updated postOwnerUser
              // postOwnerUser.save();
              // console.log("likedpost", likedPost);
              // console.log("Linker email", likerEmail);
              return res
                .status(200)
                .json({ message: "User has not liked this" });
            }
          }
        }
      }
      // Find the user whose post will be liked
    } catch (error) {
      console.error("Error liking post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.post("/like", async (req, res) => {
  const { likerEmail, postOwnerEmail, postPhotoLink } = req.body;

  if (!likerEmail || !postOwnerEmail || !postPhotoLink) {
    return res
      .status(422)
      .json({ error: "Please provide all required fields" });
  } else {
    try {
      // Find the user who is going to like the post
      const likerUser = await User.findOne({ email: likerEmail });
      if (!likerUser) {
        return res.status(404).json({ error: "Liker user not found" });
      } else {
        const postOwnerUser = await User.findOne({ email: postOwnerEmail });
        if (!postOwnerUser) {
          return res.status(404).json({ error: "Post owner user not found" });
        } else {
          // Find the post in the postOwnerUser's posts array with the given photo link

          const likedPost = postOwnerUser.posts.find(
            (post) => post.post === postPhotoLink
          );

          if (!likedPost) {
            return res
              .status(404)
              .json({ error: "Post not found with the given photo link" });
          } else {
            // Check if the liker's email is not already in the likes array of the post
            if (likedPost.likes.includes(likerEmail)) {
              return res
                .status(200)
                .json({ message: "User has already liked this" });
            } else {
              //Add the liker's email to the likes array of the post
              likedPost.likes.push(likerEmail);
              postOwnerUser.markModified("posts");
              // Save the updated postOwnerUser
              postOwnerUser.save();
              console.log("likedpost", likedPost);
              console.log("Linker email", likerEmail);
              return res.status(200).json({
                message: "User has liked this",
                likes: likedPost.likes,
              });
            }
          }
        }
      }
      // Find the user whose post will be liked
    } catch (error) {
      console.error("Error liking post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
});
router.post("/dislike", async (req, res) => {
  const { likerEmail, postOwnerEmail, postPhotoLink } = req.body;

  if (!likerEmail || !postOwnerEmail || !postPhotoLink) {
    return res
      .status(422)
      .json({ error: "Please provide all required fields" });
  } else {
    try {
      // Find the user who is going to like the post
      const likerUser = await User.findOne({ email: likerEmail });
      if (!likerUser) {
        return res.status(404).json({ error: "Liker user not found" });
      } else {
        const postOwnerUser = await User.findOne({ email: postOwnerEmail });
        if (!postOwnerUser) {
          return res.status(404).json({ error: "Post owner user not found" });
        } else {
          // Find the post in the postOwnerUser's posts array with the given photo link

          const likedPost = postOwnerUser.posts.find(
            (post) => post.post === postPhotoLink
          );

          if (!likedPost) {
            return res
              .status(404)
              .json({ error: "Post not found with the given photo link" });
          } else {
            // Check if the liker's email is not already in the likes array of the post
            if (likedPost.likes.includes(likerEmail)) {
              //Add the liker's email to the likes array of the post
              likedPost.likes = likedPost.likes.filter(
                (email) => email !== likerEmail
              );

              postOwnerUser.markModified("posts");
              // Save the updated postOwnerUser
              postOwnerUser.save();
              console.log("likedpost", likedPost);
              console.log("Linker email", likerEmail);
              return res.status(200).json({
                message: "User has disliked this",
                likes: likedPost.likes,
              });
            } else {
              return res
                .status(200)
                .json({ message: "User has already disliked this" });
            }
          }
        }
      }
      // Find the user whose post will be liked
    } catch (error) {
      console.error("Error liking post:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
});

module.exports = router;
