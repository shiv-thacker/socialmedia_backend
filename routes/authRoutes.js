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
          console.log(savedUser);
          bcrypt.compare(password, savedUser.password).then((domatch) => {
            if (domatch) {
              const token = jwt.sign(
                { _id: savedUser._id },
                process.env.JWT_SECRET
              );

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

//userdata
router.post("/userdata", (req, res) => {
  const { email } = req.body;

  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid Credentials" });
    } else {
      console.log(savedUser);
      return res.status(200).json({ message: "User found", user: savedUser });
    }
  });
});

module.exports = router;

// user.find() vs user.findOne()
//user.find() gives you multiple data of same feild data, user.findOne() gives you only first data if the feild data is same
//user.find(order above 100 rs)
//user.findOne(username)

//Error:- could not get response :-  check if you have forgot to write catch()
