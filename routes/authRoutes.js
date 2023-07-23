const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const jwt = require("jsonwebtoken"); // to check, if user already logged in
require("dotenv").config();
const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer");
// copy this mailer function from nodemaier website
async function mailer(receiveremail, code) {
  console.log("Mailer function called");
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: process.env.NodeMailer_email,
      pass: process.env.NodeMailer_password,
    },
  });

  let info = await transporter.sendMail({
    from: "Shivang",
    to: `${receiveremail}`,
    subject: "Email Verification",
    text: `Your Verification Code is ${code}`,
    html: `<b> Your Verification Code is ${code} </b>`,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

//SIgnUp

router.post("/verify", (req, res) => {
  console.log(req.body);
  const { email } = req.body;

  if (!email) {
    return res.status(422).json({ error: "please add all the feilds" });
  } else {
    //{email:email }   checks if email is exist in perticular email field.
    User.findOne({ email: email }).then(async (savedUser) => {
      console.log(savedUser);
      // if email is not exist , savedUser generate null output

      if (savedUser) {
        return res.status(422).json({ error: "Email Already Exist" });
      }
      //It's the else part, if we not write "else" here, that also ok, this code will automatically run
      try {
        let VerificationCode = Math.floor(100000 + Math.random() * 900000);
        await mailer(email, VerificationCode); // pass email & verification code to mailer function
        return res
          .status(200)
          .json({ message: "Verification code sent", VerificationCode, email });
      } catch (err) {
        return res.status(422).json({ error: "Error sending email" });
      }
    });
  }
});

router.post("/changeusername", (req, res) => {
  const { username, email } = req.body;

  // if {username:username} u can write {username}
  User.find({ username }).then(async (savedUser) => {
    //we can also meke condition with length of saveduser
    if (savedUser.length > 0) {
      return res.status(422).json({ error: "Username Already Exist" });
    } else {
      return res
        .status(200)
        .json({ message: "Username available", username, email }); // it will show output in json format at postman
    }
  });
});

router.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(422).json({ error: "please add all the fields" });
  } else {
    const user = new User({
      username,
      email,
      password,
    });

    try {
      await user.save();
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      return res.status(200).json({
        message: "User Registered Successfully & Token Generated",
        token,
      });
    } catch (err) {
      console.log(err);
      return res.status(422).json({ error: "User Not Registered" });
    }
  }
});

//forgot password

router.post("/verifyfp", (req, res) => {
  console.log(req.body);
  const { email } = req.body;

  if (!email) {
    return res.status(422).json({ error: "please add all the feilds" });
  } else {
    //{email:email }   checks if email is exist in perticular email field.
    User.findOne({ email: email }).then(async (savedUser) => {
      console.log(savedUser);
      // if email is not exist , savedUser generate null output

      if (savedUser) {
        try {
          let VerificationCode = Math.floor(100000 + Math.random() * 900000);
          await mailer(email, VerificationCode); // pass email & verification code to mailer function
          return res.status(200).json({
            message: "Verification code sent",
            VerificationCode,
            email,
          });
        } catch (err) {
          return res.status(422).json({ error: "Error sending email" });
        }
      } else {
        return res.status(422).json({ error: "Email Not Exist" });
      }
      //It's the else part, if we not write "else" here, that also ok, this code will automatically run
    });
  }
});

// You can also write .then() & .catch() instead of try,catch
router.post("/resetpassword", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ error: "Please add all the feilds" });
  } else {
    User.findOne({ email: email }).then(async (savedUser) => {
      console.log(savedUser);
      // if email is not exist , savedUser generate null output

      if (savedUser) {
        //savedUser has all feild of data,  like saveduser.is, saveduser.email , saveduser.password :
        savedUser.password = password; // here saveduser.password has old password, and we are import here new password
        savedUser
          .save()
          .then((user) => {
            return res
              .status(200)
              .json({ message: "Password change successfully" });
          })
          .catch((err) => {
            return res
              .status(422)
              .json({ error: "Password could not changed" });
          });
      } else {
        return res.status(422).json({ error: "Invalid credentials" });
      }
      //It's the else part, if we not write "else" here, that also ok, this code will automatically run
    });
  }
});

//Login (signin)
router.post("/signin", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ error: "Please add all the feilds" });
  } else {
    User.findOne({ email: email })
      .then(async (savedUser) => {
        if (!savedUser) {
          return res.status(422).json({ error: "user is not exist" });
        } else {
          //console.log(savedUser);
          bcrypt.compare(password, savedUser.password).then((domatch) => {
            if (domatch) {
              const token = jwt.sign(
                { _id: savedUser._id },
                process.env.JWT_SECRET
              );
              //({ _id: savedUser._id },process.env.JWT_SECRET)  It's making payload of token. when you want to fetch token back, payload will easily identufy
              //user_id from token

              const { _id, username, email } = savedUser;
              return res.status(200).json({
                message: "User logged in successfully",
                token,
                user: { _id, username, email },
              });
            } else {
              return res.status(422).json({ error: "password incorrect" });
            }
          });
          // return res.status(200).json({ message: "user loggen in", savedUser }); // here savedUser print all the data
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

router.post("/userdata", (req, res) => {
  // once token applied, it changes evry time
  const { authorization } = req.headers;
  // here we use other's email, to get other user's data. we will not use this to get logged in user data, because with the help of this hacker can get all data of
  // logged in user and make changes in his data.

  if (!authorization) {
    return res
      .status(400)
      .json({ error: "You must be logged in, token is not given" });
  } else {
    const token = authorization.replace("Bearer ", "");
    console.log(token);

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        return res
          .status(400)
          .json({ error: "You must be logged in, token is not given" });
      } else {
        const { _id } = payload;
        User.findOne({ _id }).then((userdata) => {
          res.status(200).send({
            message: "User found",
            user: userdata,
          });
        });
      }
    });
  }
});

//changepassword
router.post("/changepassword", (req, res) => {
  const { oldpassword, newpassword, email } = req.body;

  if (!oldpassword || !newpassword || !email) {
    return res.status(422).json({ error: "Please add all the feilds" });
  } else {
    User.findOne({ email: email }).then(async (savedUser) => {
      if (savedUser) {
        bcrypt.compare(oldpassword, savedUser.password).then((doMatch) => {
          //here doMatch is either true or false
          if (doMatch) {
            savedUser.password = newpassword;
            savedUser
              .save()
              .then((user) => {
                return res
                  .status(422)
                  .json({ message: "Your password changed successfully" });
              })
              .catch((err) => {
                return res.status(422).json({ error: "Server Error" });
              });
          } else {
            return res
              .status(422)
              .json({ error: "Your password credentials are not right" });
          }
        });
      } else {
        return res.status(422).json({ error: "User not found" });
      }
    });
  }
});

router.post("/setusername", (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(422).json({ error: "please fill all details" });
  } else {
    User.find({ username: username }).then(async (savedUser) => {
      if (savedUser.length > 0) {
        console.log(savedUser.length);
        return res.status(422).json({ error: "Sorry username already exist" });
      } else {
        console.log(savedUser.length);
        User.findOne({ email }).then(async (savedUser) => {
          if (savedUser) {
            savedUser.username = username;
            savedUser
              .save()
              .then((user) => {
                return res.status(200).json({ message: "Username updated" });
              })
              .catch((user) => {
                return res
                  .status(422)
                  .json({ error: "Sorry, there's some server error" });
              });
          } else {
            return res.status(422).json({ error: "Sorry email is not exist" });
          }
        });
      }
    });
  }
});

router.post("/setdescription", (req, res) => {
  const { description, email } = req.body;

  if (!description || !email) {
    return res.status(422).json({ error: "please fill all the feilds" });
  } else {
    User.findOne({ email: email })
      .then(async (savedUser) => {
        if (savedUser) {
          savedUser.description = description;
          savedUser.save();
          return res
            .status(422)
            .json({ message: "Description added successfully" });
        } else {
          return res.status(422).json({ error: "Email is not exist" });
        }
      })
      .catch((err) => {
        return res.status(422).json({ error: "Server Error" });
      });
  }
});

//get search user data

router.post("/searchuser", (req, res) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.status(422).json({ error: "search username" });
  }
  User.find({ username: { $regex: keyword, $options: "i" } })
    .then((user) => {
      console.log(user);
      let data = [];
      user.map((item) => {
        data.push({
          _id: item._id,
          username: item.username,
          email: item.email,
          description: item.description,
          profilepic: item.profilepic,
        });
      });
      if (data.length == 0) {
        return res.status(422).json({ error: "no user found" });
      } else {
        return res.status(200).send({ message: "user found", user: data });
      }
    })
    .catch((err) => {
      return res.status(422).json({ error: "server error" });
    });
});

//userdata
router.post("/otheruserdata", (req, res) => {
  const { email } = req.body;
  // here we use other's email, to get other user's data. we will not use this to get logged in user data, because with the help of this hacker can get all data of
  // logged in user and make changes in his data., SO we will get user data with his token

  if (!email) {
    return res.status(422).json({ error: "please add email" });
  }
  User.findOne({ email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "Email not found" });
    } else {
      console.log(savedUser);
      let data = {
        _id: savedUser._id,
        username: savedUser.username,
        description: savedUser.description,
        email: savedUser.email,
        profilepic: savedUser.profilepic,
        followers: savedUser.followers,
        following: savedUser.following,
        posts: savedUser.posts,
      };
      return res.status(200).send({ message: "User found", user: data });
    }
  });
});

// Check follower

router.post("/checkfollower", (req, res) => {
  const { followfrom, followto } = req.body;
  //followfrom : myemail
  //followto : other email
  if (!followfrom || !followto) {
    return res.status(422).json({ error: "not getting both email" });
  } else {
    User.findOne({ email: followfrom })
      .then((mainuser) => {
        if (!mainuser) {
          return res.status(422).json({ error: "current user not exist" });
        } else {
          let data = mainuser.following.includes(followto);
          // Includes response in true or false
          if (data == true) {
            return res.status(200).json({ message: "User in following list" });
          } else {
            return res
              .status(200)
              .json({ message: "User not in following list" });
          }
        }
      })
      .catch((err) => {
        return res.status(422).json({ error: `Server Error ${err}` });
      });
  }
});

//follow user

router.post("/followuser", (req, res) => {
  const { followfrom, followto } = req.body;

  //follow from :- may email
  //follow to :- other friend's email

  if (!followfrom || !followto) {
    return res.status(422).json({ error: "not getting email from request" });
  } else {
    User.findOne({ email: followfrom })
      .then((mainuser) => {
        if (!mainuser) {
          return res
            .status(422)
            .json({ error: "can't fetch your profile, please login again" });
        } else {
          let data = mainuser.following.includes(followto);

          if (data == true) {
            return res
              .status(200)
              .json({ messaage: "You are already following" });
          } else {
            mainuser.following.push(followto);
            mainuser.save();
            User.findOne({ email: followto })
              .then((otheruser) => {
                if (!otheruser) {
                  return res.status(422).json({
                    error:
                      "can't fetch other user  profile, other user not exist",
                  });
                } else {
                  let data = otheruser.followers.includes(followfrom);

                  if (data == true) {
                    return res.status(200).json({
                      messaage:
                        "other user's profile says: you are already following",
                    });
                  } else {
                    otheruser.followers.push(followfrom);
                    otheruser.save();

                    return res.status(200).json({ message: "User Following" });
                  }
                }
              })
              .catch((err) => {
                return res
                  .status(422)
                  .json({ error: "server error in finding other user" });
              });
          }
        }
      })
      .catch((err) => {
        return res.status(422).json({ error: "server error" });
      });
  }
});

//unfollow user
router.post("/unfollowuser", (req, res) => {
  const { followfrom, followto } = req.body;
  console.log("unfollowing is calling");
  if (!followfrom || !followto) {
    return res.status(422).json({ error: "not fetching emails" });
  } else {
    User.findOne({ email: followfrom }).then((mainuser) => {
      if (!mainuser) {
        return res
          .status(422)
          .json({ error: "not fetching current user, please login again" });
      } else {
        if (mainuser.following.includes(followto)) {
          mainuser.following.pull(followto);
          mainuser.save();

          User.findOne({ email: followto }).then((otheruser) => {
            if (!otheruser) {
              return res.status(422).json({
                error: "not found this user, may be he his logged out",
              });
            } else {
              if (otheruser.followers.includes(followfrom)) {
                otheruser.followers.pull(followfrom);
                otheruser.save();

                return res
                  .status(200)
                  .json({ message: "Now You are Unfollowing" });
              } else {
                return res
                  .status(422)
                  .json({ message: "You are not in it's follower's profile" });
              }
            }
          });
        } else {
          return res
            .status(200)
            .json({ message: " You are already not following that user " });
        }
      }
    });
  }
});

router.post("/hehe", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(422).json({ err: "no email" });
  }
});

module.exports = router;

// user.find() vs user.findOne()
//user.find() gives you multiple data of same feild data, user.findOne() gives you only first data if the feild data is same
//user.find(order above 100 rs)
//user.findOne(username)

//Error:- could not get response :-  check if you have forgot to write catch()
