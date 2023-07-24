const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // to save message with modification, for now we will not

const messageSchema = new mongoose.Schema(
  {
    senderid: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    roomid: {
      type: String,
      required: true,
    },
    recieverid: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, //DO timestamps true, to set with sorting
  }
);

mongoose.model("Message", messageSchema);
