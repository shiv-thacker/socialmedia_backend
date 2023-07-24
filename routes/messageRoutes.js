const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Message = mongoose.model("Message");
const jwt = require("jsonwebtoken"); // to check, if user already logged in
require("dotenv").config();
const bcrypt = require("bcrypt");

//we can use try, catch also

router.post("/savemessagetodb", async (req, res) => {
  const { senderid, message, roomid, recieverid } = req.body;
  try {
    const newMessage = new Message({
      senderid,
      message,
      roomid,
      recieverid,
    });

    await newMessage.save();
    res.send("Message sent successfully");
  } catch (err) {
    console.log(" ERROR WHILE SAVING MESSAGE TO LINE 18 :", err);
    res.status(422).send(err.Message);
  }
});

router.post("/getmessages", async (req, res) => {
  const { roomid } = req.body;

  if (!roomid) {
    res.send("error");
  }

  Message.find({ roomid: roomid })
    .then((message) => {
      res.send(message);
    })
    .catch((err) => {
      res.send(err);
    });
});

router.post("/setusermessages", async (req, res) => {
  const { ouruserid, fuserid, lastmessage, roomid } = req.body;

  // console.log("MESSAGE RECIEVED :", req.body)

  User.findOne({ _id: ouruserid })
    .then((user) => {
      user.allmessages.map((item) => {
        if (item.fuserid == fuserid) {
          user.allmessages.pull(item.fuserid);
        }
      });

      const date = Date.now();

      user.allmessages.push({
        ouruserid,
        fuserid,
        lastmessage,
        roomid,
        date,
      });

      user.save();
      res.status(200).send({ message: "Message saved successfully" });
    })
    .catch((err) => {
      console.log("error updating all chats line 74", err);
      res.status(422).send(err.message);
    });
});
router.post("/getusermessages", async (req, res) => {
  const { userid } = req.body;

  console.log("USERID RECIEVED :", req.body);

  User.findOne({ _id: userid })
    .then((user) => {
      res.status(200).send(user.allmessages);
    })
    .catch((err) => {
      console.log("error updating all chats line 74", err);
      res.status(422).send(err.message);
    });
});

module.exports = router;
