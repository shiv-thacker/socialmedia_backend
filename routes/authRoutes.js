const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const jwt = require("jsonwebtoken"); // to check, if user already logged in
require("dotenv").config();

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
        return res.status(422).json({ error: "Error sending emial" });
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
      return res
        .status(200)
        .json({
          message: "User Registered Successfully & Token Generated",
          token,
        });
    } catch (err) {
      console.log(err);
      return res.status(422).json({ error: "User Not Registered" });
    }
  }
});

module.exports = router;
